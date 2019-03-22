import { XyoLogger } from '@xyo-network/logger'
import { resolvers, IResolvers, XyoNode, IXyoNodeOptions, IXyoNetworkConfig, IXyoNodeConfig } from '@xyo-network/base-node'
import { IXyoOriginBlockRepository, XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { XyoOriginChainStateInMemoryRepository, XyoOriginChainLocalStorageRepository } from '@xyo-network/origin-chain'
import { NobleScan } from '@xyo-network/ble.noble'
import { serializer } from '@xyo-network/serializer'
import { XyoBluetoothNetwork } from '@xyo-network/network.ble'
import { getSignerProvider } from '@xyo-network/signing.ecdsa'
import { IXyoPayload, XyoBoundWitness, XyoBoundWitnessValidator } from '@xyo-network/bound-witness'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoProvider } from '@xyo-network/utils'
import { XyoBoundWitnessInteraction } from '@xyo-network/peer-interaction-handlers'
import { IXyoNetworkProcedureCatalogue, CatalogueItem, IXyoNetworkProvider } from '@xyo-network/network'
import { XyoStorageBridgeQueueRepository } from '@xyo-network/bridge-queue-repository.keyvalue'
import { XyoLevelDbStorageProvider } from '@xyo-network/storage.leveldb'
import { IXyoHashProvider, getHashingProvider, IXyoHash } from '@xyo-network/hashing'
import { XyoBridgeQueue, XyoBridgeOption } from '@xyo-network/bridge-queue-repository'
import { IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessSuccessListener, IXyoBoundWitnessInteractionFactory, XyoBoundWitnessPayloadProvider, XyoBoundWitnessSuccessListener, XyoBoundWitnessHandlerProvider } from '@xyo-network/peer-interaction'
import { XyoBridgeBoundWitnessSuccessListener } from '../xyo-bridge-bound-witness-success-listener'
import { XyoNodeRunner, IXyoNodeRunnerDelegate } from '@xyo-network/node-runner'
import { XyoPeerInteractionRouter } from '@xyo-network/peer-interaction-router'
import { XyoBrideProcedureCatalogue } from '../xyo-bridge-procedure-catalogue'
import { XyoClientTcpNetwork, IXyoNetworkAddressProvider, IXyoTCPNetworkAddress } from '@xyo-network/network.tcp'
import { IXyoPeerConnectionDelegate, XyoSimplePeerConnectionDelegate, XyoPeerConnectionHandler, IXyoCatalogueResolver } from '@xyo-network/peer-connections'
import { IXyoBridgeConfig } from '../@types'
import { XyoBridge } from '../xyo-bridge'

const bridgeEntryPoint = async () => {
  const hasher = getHashingProvider('sha256')
  const scanner = new NobleScan()
  const bleNetwork = new XyoBluetoothNetwork(scanner)
  const storageProvider = new XyoLevelDbStorageProvider("./bridge-data/")
  const bridgeQueueRepo = new XyoStorageBridgeQueueRepository(storageProvider)
  const blockRepo = new XyoOriginBlockRepository(storageProvider, serializer, hasher)
  const chainRepo = new XyoOriginChainLocalStorageRepository(storageProvider, blockRepo, serializer)
  const logger = new XyoLogger(false, false)

  const tcpPeers: IXyoNetworkAddressProvider =  {
    next: async () => {
      const peer: IXyoTCPNetworkAddress = {
        host: "alpha-peers.xyo.network",
        port: 11000
      }

      return peer
    }
  }
  const tcpClient = new XyoClientTcpNetwork(tcpPeers)

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

bridgeEntryPoint()
