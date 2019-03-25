
// import { XyoLogger } from '@xyo-network/logger'
// import { XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
// import { XyoOriginChainLocalStorageRepository } from '@xyo-network/origin-chain'
// import { NobleScan } from '@xyo-network/ble.noble'
// import { serializer } from '@xyo-network/serializer'
// import { XyoBluetoothNetwork } from '@xyo-network/network.ble'
// import { XyoStorageBridgeQueueRepository } from '@xyo-network/bridge-queue-repository.keyvalue'
// import { XyoLevelDbStorageProvider } from '@xyo-network/storage.leveldb'
// import { getHashingProvider } from '@xyo-network/hashing'
// import { XyoClientTcpNetwork, IXyoNetworkAddressProvider, IXyoTCPNetworkAddress } from '@xyo-network/network.tcp'
// import { IXyoBridgeConfig } from '../@types'
// import { XyoBridge } from '../xyo-bridge'

// export const bridgeEntryPoint = async () => {
//   const hasher = getHashingProvider('sha256')
//   const scanner = new NobleScan()
//   const bleNetwork = new XyoBluetoothNetwork(scanner)
//   const storageProvider = new XyoLevelDbStorageProvider("./w4feef/")
//   const bridgeQueueRepo = new XyoStorageBridgeQueueRepository(storageProvider)
//   const blockRepo = new XyoOriginBlockRepository(storageProvider, serializer, hasher)
//   const chainRepo = new XyoOriginChainLocalStorageRepository(storageProvider, blockRepo, serializer)
//   const logger = new XyoLogger(false, false)

//   const tcpPeers: IXyoNetworkAddressProvider = {
//     next: async () => {
//       const peer: IXyoTCPNetworkAddress = {
//         host: "alpha-peers.xyo.network",
//         port: 11000
//       }

//       return peer
//     }
//   }
//   const tcpClient = new XyoClientTcpNetwork(tcpPeers)

//   const bridgeConfig: IXyoBridgeConfig  = {
//     hasher,
//     storageProvider,
//     bridgeQueueRepo,
//     blockRepo,
//     chainRepo,
//     logger
//   }

//   const bridge = new XyoBridge(bleNetwork, tcpClient, bridgeConfig)

//   await bridge.init()

//   setTimeout(() => {
//     bridge.start()
//   }, 2000)
// }

// bridgeEntryPoint()
