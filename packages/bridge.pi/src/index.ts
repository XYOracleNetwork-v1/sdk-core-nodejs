
import { PiWifiManager } from '@xyo-network/wifi-manager'
import { startBleServices, NetworkService } from '@xyo-network/bridge-ble'
import { BridgeServer } from '@xyo-network/bridge-server'
import { XyoLogger } from '@xyo-network/logger'
import { XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { XyoOriginChainLocalStorageRepository } from '@xyo-network/origin-chain'
import { NobleScan } from '@xyo-network/ble.noble'
import { serializer } from '@xyo-network/serializer'
import { XyoBluetoothNetwork } from '@xyo-network/network.ble'
import { XyoStorageBridgeQueueRepository } from '@xyo-network/bridge-queue-repository.keyvalue'
import { XyoLevelDbStorageProvider } from '@xyo-network/storage.leveldb'
import { getHashingProvider, IXyoHashProvider } from '@xyo-network/hashing'
import { XyoClientTcpNetwork, IXyoNetworkAddressProvider, IXyoTCPNetworkAddress } from '@xyo-network/network.tcp'
import { IXyoBridgeConfig, XyoBridge } from '@xyo-network/bridge'
import { IXyoStorageProvider } from '@xyo-network/storage'

const STORAGE_PASSWORD_KEY = "STORAGE_PASSWORD_KEY"
const ARCHIVIST_STORAGE_KEY = "ARCHIVIST_STORAGE_KEY"

const hasher = getHashingProvider('sha256')
const scanner = new NobleScan()
const bleNetwork = new XyoBluetoothNetwork(scanner)
const storageProvider = new XyoLevelDbStorageProvider("./bridge-data/")
const bridgeQueueRepo = new XyoStorageBridgeQueueRepository(storageProvider)
const blockRepo = new XyoOriginBlockRepository(storageProvider, serializer, hasher)
const chainRepo = new XyoOriginChainLocalStorageRepository(storageProvider, blockRepo, serializer)
const logger = new XyoLogger(false, false)

const defaultArchivists: IXyoTCPNetworkAddress[] = [
  {
    host: "alpha-peers.xyo.network",
    port: 11000
  }
]

const activeArchivists: IXyoTCPNetworkAddress[] = defaultArchivists

const tcpPeerSelector: IXyoNetworkAddressProvider = {
  next: async () => {
    return activeArchivists[Math.floor(Math.random() * activeArchivists.length)]
  }
}

const tcpClient = new XyoClientTcpNetwork(tcpPeerSelector)

const startPi = async () => {
  const port = 13000
  const piWifi = new PiWifiManager()
  const server = new BridgeServer({ port, wifi: piWifi })
  const networkService = new NetworkService(piWifi)

  await networkService.start()
  await startBleServices(process.env.DISPLAY_NAME || 'XYO Bridge', [
    networkService
  ])

  server.start(() => {
    logger.info(`Server ready at http://localhost:${port}`)
  })

  startBridge()
}

const startBridge = async () => {
  const bridgeConfig: IXyoBridgeConfig  = {
    hasher,
    storageProvider,
    bridgeQueueRepo,
    blockRepo,
    chainRepo,
    logger
  }

  const bridge = new XyoBridge(bleNetwork, tcpClient, bridgeConfig)
  await bridge.init()
  setTimeout(() => {
    bridge.start()
  }, 2000)
}

const addArchivist = async (archivist: IXyoTCPNetworkAddress, storage: IXyoStorageProvider) => {
  activeArchivists.push(archivist)
  await storeArchivists(activeArchivists, storage)
}

const removeArchivists = async (archivistToRemove: IXyoTCPNetworkAddress, storage: IXyoStorageProvider) => {
  const newArchivists: IXyoTCPNetworkAddress[] = []

  activeArchivists.forEach((archivist) => {
    if (archivist.port !== archivistToRemove.port && archivistToRemove.host !== archivist.host) {
      newArchivists.push(archivist)
    }
  })

  await storeArchivists(newArchivists, storage)
}

const restoreArchivists = async (storage: IXyoStorageProvider,
                                constArchivists: IXyoTCPNetworkAddress[]): Promise<IXyoTCPNetworkAddress[]> => {
  const archivistsInStorage = await getArchivists(storage)
  return archivistsInStorage.concat(constArchivists)
}

const storeNewPassword = async (password: Buffer, storage: IXyoStorageProvider) => {
  const key = Buffer.from(STORAGE_PASSWORD_KEY)
  await storage.write(key, password)
}

const getPassword = async (storage: IXyoStorageProvider) => {
  const key = Buffer.from(STORAGE_PASSWORD_KEY)
  return storage.read(key)
}

const hashAndCheckRightPassword = async (storage: IXyoStorageProvider,
                                        password: Buffer, hashCreator: IXyoHashProvider) => {
  const hashOfPassword = await hashPassword(password, hashCreator)
  return checkIfRightPassword(storage, hashOfPassword)
}

const checkIfRightPassword = async (storage: IXyoStorageProvider, password: Buffer) => {
  const rightPassword  = await getPassword(storage)
  return rightPassword === password
}

const hashPassword = async (password: Buffer, hashCreator: IXyoHashProvider) => {
  const hashedPassword = await hashCreator.createHash(password)
  return hashedPassword.serialize()
}

const storeArchivists = async (archivists: IXyoTCPNetworkAddress[], storage: IXyoStorageProvider) => {
  const bufferArchivists = Buffer.from(JSON.stringify(archivists))
  const key = Buffer.from(ARCHIVIST_STORAGE_KEY)
  await storage.write(key, bufferArchivists)
}

const getArchivists = async (storage: IXyoStorageProvider): Promise<IXyoTCPNetworkAddress[]> => {
  const key = Buffer.from(ARCHIVIST_STORAGE_KEY)
  const bufferArchivists = await storage.read(key)

  if (bufferArchivists) {
    const stringArchivists = bufferArchivists.toString('utf8')
    return JSON.parse(stringArchivists) as IXyoTCPNetworkAddress[]
  }

  return [] as IXyoTCPNetworkAddress[]
}

startPi()
