import { PiWifiManager } from '@xyo-network/wifi-manager'
// import { startBleServices, NetworkService } from '@xyo-network/bridge-ble'
import { BridgeServer, IContext } from '@xyo-network/bridge-server'
import { XyoLogger } from '@xyo-network/logger'
import { XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { XyoOriginChainLocalStorageRepository, XyoPaymentKey } from '@xyo-network/origin-chain'
import { NobleScan } from '@xyo-network/ble.noble'
import { serializer } from '@xyo-network/serializer'
import { XyoBluetoothNetwork } from '@xyo-network/network.ble'
import { XyoStorageBridgeQueueRepository } from '@xyo-network/bridge-queue-repository.keyvalue'
import { XyoLevelDbStorageProvider } from '@xyo-network/storage.leveldb'
import { getHashingProvider, IXyoHashProvider } from '@xyo-network/hashing'
import { XyoClientTcpNetwork, IXyoNetworkAddressProvider, IXyoTCPNetworkAddress } from '@xyo-network/network.tcp'
import { IXyoBridgeConfig, XyoBridge } from '@xyo-network/bridge'
import { IXyoStorageProvider } from '@xyo-network/storage'
import { IXyoSerializableObject } from '@xyo-network/serialization'
import { IBridgeConfigurationManager, IArchivist } from '@xyo-network/bridge-configuration'
import { XyoBridgeArchivistQueue } from './xyo-bridge-archivist-queue'

const STORAGE_PASSWORD_KEY = "STORAGE_PASSWORD_KEY"
const ARCHIVIST_STORAGE_KEY = "ARCHIVIST_STORAGE_KEY"
const PAYMENT_KEY_KEY = "PAYMENT_KEY_KEY"
const BRIDGE_DEFAULT_PASSWORD = "xyxyo"

const hasher = getHashingProvider('sha256')
const scanner = new NobleScan()
const bleNetwork = new XyoBluetoothNetwork(scanner)
const storageProvider = new XyoLevelDbStorageProvider("./bridge-store/")
const bridgeQueueRepo = new XyoStorageBridgeQueueRepository(storageProvider)
const blockRepo = new XyoOriginBlockRepository(storageProvider, serializer, hasher)
const chainRepo = new XyoOriginChainLocalStorageRepository(storageProvider, blockRepo, serializer)
const logger = new XyoLogger(false, false)
const archivistQueue = new XyoBridgeArchivistQueue()
const tcpClient = new XyoClientTcpNetwork(archivistQueue.tcpPeerSelector)

const defaultArchivists: IXyoTCPNetworkAddress[] = [
  {
    host: "alpha-peers.xyo.network",
    port: 11000
  }
]

const bridgeConfig: IXyoBridgeConfig  = {
  hasher,
  storageProvider,
  bridgeQueueRepo,
  blockRepo,
  chainRepo,
  logger
}

const bridge = new XyoBridge(bleNetwork, tcpClient, bridgeConfig)

const startPi = async () => {
  const port = 13000
  const piWifi = new PiWifiManager()

  const conf: IBridgeConfigurationManager = {
    isConfigured,
    getPublicKey: getPublicKeyFromBridge,
    getPaymentKey: getPaymentKeyFromBridge,
    setPaymentKey: setBridgePaymentKey,
    setDefaultArchivist: setDefaultArchivistForBridge,
    getDefaultArchivist: getDefaultArchivistForBridge,
    getAttachedArchivists: getAttachedArchivistsForBridge,
    attachArchivist: attachArchivistToBridge,
    detachArchivist: detachArchivistForBridge,
    verifyPin: validatePin,
    updatePin: changePasswordForBridge
  }

  const context: IContext = {
    port,
    wifi: piWifi,
    configuration: conf
  }

  const server = new BridgeServer(context)
  // const networkService = new NetworkService(piWifi, validatePin)

  // await networkService.start()
  // await startBleServices(process.env.DISPLAY_NAME || 'XYO Bridge', [
  //   networkService
  // ])

  server.start(() => {
    logger.info(`Server ready at http://localhost:${port}`)
  })

  startBridge()
}

const startBridge = async () => {
  archivistQueue.activeArchivists = await restoreArchivists(storageProvider, defaultArchivists)
  await bridge.init()

  setTimeout(() => {
    bridge.start()
  }, 2000)
}

const changePasswordForBridge = async (oldPassword: string, newPassword: string): Promise<string> => {
  const oldPasswordBuffer = Buffer.from(oldPassword)
  const newPasswordBuffer = Buffer.from(newPassword)

  const result = await changePassword(oldPasswordBuffer, newPasswordBuffer, storageProvider, hasher)

  return result.toString()
}

const isConfigured = async (): Promise<boolean> => {
  const passwordNow = await getPassword(storageProvider)
  return !!Buffer.compare(passwordNow, Buffer.from(BRIDGE_DEFAULT_PASSWORD))
}

const detachArchivistForBridge = async (id: string): Promise<IArchivist> => {
  const allArchivists = archivistQueue.activeArchivists

  for (const archivist of allArchivists) {
    const archivistId = `${archivist.host}:${archivist.port}`

    if (id === archivistId) {
      const archivistToRemove: IArchivist = {
        port: archivist.port,
        dns: archivist.host,
        id: archivistId,
      }

      await removeArchivist(archivist, storageProvider)

      return archivistToRemove
    }
  }

  throw Error("No archivist found!")
}

const attachArchivistToBridge = async (dns: string, port: number): Promise<IArchivist> => {
  const archivistToAdd: IArchivist = {
    port,
    dns,
    id: `${dns}:${port}`,
  }

  const tcp: IXyoTCPNetworkAddress = {
    port,
    host: dns,
  }

  await addArchivist(tcp, storageProvider)

  return archivistToAdd
}

const getAttachedArchivistsForBridge = async (): Promise<IArchivist[]> => {
  const returnArchivists: IArchivist[] = []
  const allArchivists = archivistQueue.activeArchivists

  for (const archivist of allArchivists) {
    const archivistId = `${archivist.host}:${archivist.port}`

    returnArchivists.push({
      port: archivist.port,
      dns: archivist.host,
      id: archivistId,
    })
  }
  return returnArchivists
}

const getDefaultArchivistForBridge = async (): Promise<IArchivist> => {
  if (archivistQueue.activeArchivists.length > 0) {
    return archivistQueue.activeArchivists[0]
  }

  throw Error("No archivists!")
}

const setDefaultArchivistForBridge = async (id: string): Promise<IArchivist> => {
  const allArchivists = archivistQueue.activeArchivists

  for (const archivist of allArchivists) {
    const archivistId = `${archivist.host}:${archivist.port}`

    if (id === archivistId) {
      const archivistToRemove: IArchivist = {
        port: archivist.port,
        dns: archivist.host,
        id: archivistId,
      }

      await removeArchivist(archivist, storageProvider)
      archivistQueue.activeArchivists.unshift(archivist)
      await storeArchivists(archivistQueue.activeArchivists, storageProvider)

      return archivistToRemove
    }
  }

  throw Error("No archivist found!")
}

const paymentKeyHeuristicsCreator = (key: XyoPaymentKey): (() => Promise<IXyoSerializableObject>) => {
  return async () => {
    return key
  }
}

// the key must be a hex value
const setBridgePaymentKey = async (key: string): Promise<string> => {
  const encodedKey = Buffer.from(key, "hex")
  const paymentKey = new XyoPaymentKey(encodedKey)
  const provider = paymentKeyHeuristicsCreator(paymentKey)

  bridge.payloadProvider.removeHeuristicsProvider("PAYMENT_KEY", true)
  bridge.payloadProvider.addHeuristicsProvider("PAYMENT_KEY", true, provider)

  await storePaymentKey(encodedKey, storageProvider)

  return key
}

const getPaymentKeyFromBridge = async (): Promise<string> => {
  const key = await getPaymentKey(storageProvider)

  if (key) {
    return key.toString("hex")
  }

  return "No key set"
}

const getPublicKeyFromBridge = async (): Promise<string> => {
  const signer = await chainRepo.getGenesisSigner()

  if (signer) {
    return signer.serializeHex()
  }

  return ""
}

const validatePin = async (pin: string): Promise<boolean> => {
  return checkIfRightPassword(storageProvider, Buffer.from(pin))
}

const addArchivist = async (archivist: IXyoTCPNetworkAddress, storage: IXyoStorageProvider) => {
  archivistQueue.activeArchivists.push(archivist)
  await storeArchivists(archivistQueue.activeArchivists, storage)
}

const removeArchivist = async (archivistToRemove: IXyoTCPNetworkAddress, storage: IXyoStorageProvider) => {
  const newArchivists: IXyoTCPNetworkAddress[] = []

  archivistQueue.activeArchivists.forEach((archivist) => {
    if (archivist.port !== archivistToRemove.port && archivistToRemove.host !== archivist.host) {
      newArchivists.push(archivist)
    }
  })

  archivistQueue.activeArchivists = newArchivists

  await storeArchivists(newArchivists, storage)
}

const restoreArchivists = async (storage: IXyoStorageProvider,
                                 constArchivists: IXyoTCPNetworkAddress[]): Promise<IXyoTCPNetworkAddress[]> => {
  const archivistsInStorage = await getArchivists(storage)
  return archivistsInStorage.concat(constArchivists)
}

const changePassword = async (password: Buffer,
                              newPassword: Buffer,
                              storage: IXyoStorageProvider,
                              hash: IXyoHashProvider): Promise<boolean> => {

  if (await hashAndCheckRightPassword(storage, password, hash)) {
    storeNewPassword(await hashPassword(newPassword, hash), storage)
    return true
  }

  return false
}

const storeNewPassword = async (password: Buffer, storage: IXyoStorageProvider) => {
  const key = Buffer.from(STORAGE_PASSWORD_KEY)
  await storage.write(key, password)
}

const getPassword = async (storage: IXyoStorageProvider): Promise<Buffer> => {
  const key = Buffer.from(STORAGE_PASSWORD_KEY)
  const hasKey = await storage.containsKey(key)

  if (hasKey) {
    const inStore = await storage.read(key)

    if (inStore) {
      return inStore
    }
  }

  return Buffer.from(BRIDGE_DEFAULT_PASSWORD)
}

const hashAndCheckRightPassword = async (storage: IXyoStorageProvider,
                                         password: Buffer,
                                        hashCreator: IXyoHashProvider) => {
  const hashOfPassword = await hashPassword(password, hashCreator)
  return checkIfRightPassword(storage, hashOfPassword)
}

const checkIfRightPassword = async (storage: IXyoStorageProvider, password: Buffer) => {
  const rightPassword  = await getPassword(storage)
  return !Buffer.compare(rightPassword, password)
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
  const hasKey = await storage.containsKey(key)

  if (hasKey) {
    const bufferArchivists = await storage.read(key)

    if (bufferArchivists) {
      const stringArchivists = bufferArchivists.toString('utf8')
      return JSON.parse(stringArchivists) as IXyoTCPNetworkAddress[]
    }
  }

  return [] as IXyoTCPNetworkAddress[]
}

const storePaymentKey = async (paymentKey: Buffer, storage: IXyoStorageProvider) => {
  const key = Buffer.from(PAYMENT_KEY_KEY)
  storage.write(key, paymentKey)
}

const getPaymentKey = async (storage: IXyoStorageProvider): Promise<Buffer | undefined> => {
  const key = Buffer.from(PAYMENT_KEY_KEY)
  const hasKey = await storage.containsKey(key)

  if (hasKey) {
    return storage.read(key)
  }

  return undefined
}

export function main() {
  startPi()
}
