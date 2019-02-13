/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 1:51:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th February 2019 4:01:01 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-line-length

import { IXyoNodeRunnerDelegate } from '@xyo-network/node-runner'
import { IXyoProvider, IXyoResolvers, IXyoDiscoveryConfig, IXyoNodeNetworkConfig, IXyoPeerTransportConfig, IXyoNetworkConfig, IXyoNetworkProcedureCatalogueConfig, IXyoOriginChainConfig } from '../@types'
import { IXyoPeerConnectionDelegate, XyoSimplePeerConnectionDelegate, XyoPeerConnectionHandler } from '@xyo-network/peer-connections'
import { IXyoNodeNetwork, XyoNodeNetwork } from '@xyo-network/node-network'
import { IXyoP2PService, IXyoPeerDiscoveryService, XyoP2PService, XyoPeerTransport, XyoPeerDiscoveryService, IXyoPeerTransport } from '@xyo-network/p2p'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { IXyoHashProvider, getHashingProvider, IXyoHash } from '@xyo-network/hashing'
import { IXyoOriginChainRepository, XyoOriginChainStateInMemoryRepository, XyoOriginChainLocalStorageRepository } from '@xyo-network/origin-chain'
import { IXyoOriginBlockRepository, XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessSuccessListener, XyoBoundWitnessPayloadProvider, XyoBoundWitnessSuccessListener, XyoBoundWitnessHandlerProvider, IXyoBoundWitnessInteractionFactory } from '@xyo-network/peer-interaction'
import { serializer } from '@xyo-network/serializer'
import { IXyoSigner } from '@xyo-network/signing'
import { XyoInMemoryStorageProvider } from '@xyo-network/storage'
import { XyoBoundWitnessValidator, IXyoBoundWitnessValidationOptions } from '@xyo-network/bound-witness'
import { IXyoNetworkProvider, IXyoNetworkProcedureCatalogue, CatalogueItem, XyoNetworkProcedureCatalogue } from '@xyo-network/network'
import { XyoServerTcpNetwork } from '@xyo-network/network.tcp'
import { XyoPeerInteractionRouter } from '@xyo-network/peer-interaction-router'
import { XyoBoundWitnessTakeOriginChainServerInteraction, XyoBoundWitnessStandardServerInteraction } from '@xyo-network/peer-interaction-handlers'
import { getSignerProvider } from '@xyo-network/signing.ecdsa'
import { IXyoRepository, createDirectoryIfNotExists } from '@xyo-network/utils'
import { IXyoTransaction } from '@xyo-network/transaction-pool'
import { IResolvers } from '../xyo-resolvers-enum'
import { XyoLevelDbStorageProvider } from '@xyo-network/storage.leveldb'

const nodeRunnerDelegate: IXyoProvider<IXyoNodeRunnerDelegate, undefined> = {
  async get(container) {
    const peerConnection = await container.get<IXyoPeerConnectionDelegate>(IResolvers.PEER_CONNECTION_DELEGATE)
    const nodeNet = await container.get<IXyoNodeNetwork>(IResolvers.NODE_NETWORK) // this will initialize it

    return {
      run: async () => {
        const networkPipe = await peerConnection.provideConnection()
        await peerConnection.handlePeerConnection(networkPipe)
      },
      onStop: async () => {
        return peerConnection.stopProvidingConnections()
      }
    }
  }
}

const nodeNetwork: IXyoProvider<IXyoNodeNetwork, IXyoNodeNetworkConfig> = {
  async get(container, config) {
    const p2p = await container.get<IXyoP2PService>(IResolvers.P2P_SERVICE)
    const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)
    const hasher = await container.get<IXyoHashProvider>(IResolvers.HASH_PROVIDER)
    const originChainRepo = await container.get<IXyoOriginChainRepository>(IResolvers.ORIGIN_CHAIN_REPOSITORY)
    const originBlockRepo = await container.get<IXyoOriginBlockRepository>(IResolvers.ORIGIN_BLOCK_REPOSITORY)
    const payloadProvider = await container.get<IXyoBoundWitnessPayloadProvider>(IResolvers.BOUND_WITNESS_PAYLOAD_PROVIDER)
    const boundWitnessSuccess = await container.get<IXyoBoundWitnessSuccessListener>(IResolvers.BOUND_WITNESS_SUCCESS_LISTENER)
    const transactionRepository = await container.get<IXyoRepository<IXyoHash, IXyoTransaction<any>>>(IResolvers.TRANSACTION_REPOSITORY)

    const networkService = new XyoNodeNetwork(
      p2p,
      serialization,
      hasher,
      originBlockRepo,
      originChainRepo,
      payloadProvider,
      boundWitnessSuccess,
      transactionRepository
    )

    const features = await config.features
    networkService.setFeatures(features)

    if (config.shouldServiceBlockPermissionRequests) {
      networkService.serviceBlockPermissionRequests()
    }

    return networkService
  }
}

const p2pService: IXyoProvider<IXyoP2PService, undefined> = {
  async get(container) {
    const discoveryNetworkService = await container.get<IXyoPeerDiscoveryService>(IResolvers.DISCOVERY_NETWORK)
    return new XyoP2PService(discoveryNetworkService)
  }
}

const discoveryNetwork: IXyoProvider<IXyoPeerDiscoveryService, IXyoDiscoveryConfig> = {
  async get(container, config) {
    const transport = await container.get<IXyoPeerTransport>(IResolvers.PEER_TRANSPORT)
    const service =  new XyoPeerDiscoveryService(transport)
    await service.initialize(config)
    await service.start()
    await service.addBootstrapNodes(config.bootstrapNodes)
    return service
  }
}

const peerTransport: IXyoProvider<IXyoPeerTransport, IXyoPeerTransportConfig> = {
  async get(container, config) {
    const transport = new XyoPeerTransport()
    transport.initialize(config.address)
    return transport
  }
}

const serializationService: IXyoProvider<IXyoSerializationService, undefined> = {
  async get(container) {
    return serializer
  }
}

const hashProvider: IXyoProvider<IXyoHashProvider, undefined> = {
  async get(container) {
    return getHashingProvider('sha256')
  }
}

const originChainRepository: IXyoProvider<IXyoOriginChainRepository, IXyoOriginChainConfig> = {
  async get(container, config) {
    const originBlockRepo = await container.get<IXyoOriginBlockRepository>(IResolvers.ORIGIN_BLOCK_REPOSITORY)
    const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)
    await createDirectoryIfNotExists(config.data)
    const db = XyoLevelDbStorageProvider.createStore(config.data)
    return new XyoOriginChainLocalStorageRepository(db, originBlockRepo, serialization)
  },
  async postInit(originChainRepo, container) {
    const originChainSigners = await originChainRepo.getSigners()

    if (originChainSigners.length === 0) {
      const signers = await container.get<IXyoSigner[]>(IResolvers.SIGNERS)
      await originChainRepo.setCurrentSigners(signers)
    }

    const currentIndex = await originChainRepo.getIndex()
    if (currentIndex === 0) { // create genesis block
      const genesisBlock = await originChainRepo.createGenesisBlock()
      const successListener = await container.get<IXyoBoundWitnessSuccessListener>(IResolvers.BOUND_WITNESS_SUCCESS_LISTENER)
      await successListener.onBoundWitnessSuccess(genesisBlock)
    }

    return
  }
}

const originBlockRepository: IXyoProvider<IXyoOriginBlockRepository, undefined> = {
  async get(container) {
    const storageProvider = new XyoInMemoryStorageProvider()
    const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)
    const hasher = await container.get<IXyoHashProvider>(IResolvers.HASH_PROVIDER)
    return new XyoOriginBlockRepository(storageProvider, serialization, hasher)
  }
}

const boundWitnessPayloadProvider: IXyoProvider<IXyoBoundWitnessPayloadProvider, undefined> = {
  async get(container) {
    return new XyoBoundWitnessPayloadProvider()
  }
}

const boundWitnessSuccessListener: IXyoProvider<IXyoBoundWitnessSuccessListener, undefined> = {
  async get(container) {
    const hasher = await container.get<IXyoHashProvider>(IResolvers.HASH_PROVIDER)
    const originBlockRepo = await container.get<IXyoOriginBlockRepository>(IResolvers.ORIGIN_BLOCK_REPOSITORY)
    const validator = await container.get<XyoBoundWitnessValidator>(IResolvers.BOUND_WITNESS_VALIDATOR)
    const originChainRepo = await container.get<IXyoOriginChainRepository>(IResolvers.ORIGIN_CHAIN_REPOSITORY)

    return new XyoBoundWitnessSuccessListener(
      hasher,
      validator,
      originChainRepo,
      originBlockRepo
    )
  }
}

const boundWitnessValidator: IXyoProvider<XyoBoundWitnessValidator, IXyoBoundWitnessValidationOptions> = {
  async get(container, config) {
    return new XyoBoundWitnessValidator(config)
  }
}

const peerConnectionDelegate: IXyoProvider<IXyoPeerConnectionDelegate, undefined> = {
  async get(container) {
    const networkService = await container.get<IXyoNetworkProvider>(IResolvers.NETWORK)
    const catalogue = await container.get<IXyoNetworkProcedureCatalogue>(IResolvers.NETWORK_PROCEDURE_CATALOGUE)
    const peerInteractionRouter = new XyoPeerInteractionRouter()
    const originStateRepository = await container.get<IXyoOriginChainRepository>(IResolvers.ORIGIN_CHAIN_REPOSITORY)
    const boundWitnessPayload = await container.get<IXyoBoundWitnessPayloadProvider>(IResolvers.BOUND_WITNESS_PAYLOAD_PROVIDER)
    const boundWitnessSuccess = await container.get<IXyoBoundWitnessSuccessListener>(IResolvers.BOUND_WITNESS_SUCCESS_LISTENER)
    const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)

    const standardServerInteractionFactory: IXyoBoundWitnessInteractionFactory = {
      newInstance: (signers, payload) =>  {
        return new XyoBoundWitnessStandardServerInteraction(
          signers,
          payload,
          serialization
        )
      }
    }

    const standardBoundWitnessHandlerProvider = new XyoBoundWitnessHandlerProvider(
      originStateRepository,
      boundWitnessPayload,
      boundWitnessSuccess,
      standardServerInteractionFactory
    )

    const takeOriginChainServerInteractionFactory: IXyoBoundWitnessInteractionFactory = {
      newInstance: (signers, payload) =>  {
        return new XyoBoundWitnessTakeOriginChainServerInteraction(
          signers,
          payload,
          serialization
        )
      }
    }

    const takeOriginChainBoundWitnessHandler =  new XyoBoundWitnessHandlerProvider(
      originStateRepository,
      boundWitnessPayload,
      boundWitnessSuccess,
      takeOriginChainServerInteractionFactory
    )

    // Routes
    peerInteractionRouter.use(CatalogueItem.BOUND_WITNESS, () => {
      return standardBoundWitnessHandlerProvider
    })

    peerInteractionRouter.use(CatalogueItem.TAKE_ORIGIN_CHAIN, () => {
      return takeOriginChainBoundWitnessHandler
    })

    const peerConnectionHandler = new XyoPeerConnectionHandler(peerInteractionRouter, peerInteractionRouter)

    return new XyoSimplePeerConnectionDelegate(networkService, catalogue, peerConnectionHandler)
  }
}

const network: IXyoProvider<IXyoNetworkProvider, IXyoNetworkConfig> = {
  async get(container, config) {
    return new XyoServerTcpNetwork(config.port)
  }
}

const networkProcedureCatalogue: IXyoProvider<IXyoNetworkProcedureCatalogue, IXyoNetworkProcedureCatalogueConfig> = {
  async get(container, config) {
    const procedureCatalogue =  new XyoNetworkProcedureCatalogue()
    procedureCatalogue.setCatalogue(config.catalogue)
    return procedureCatalogue
  }
}

const signersProvider: IXyoProvider<IXyoSigner[], undefined> = {
  async get(container) {
    return [getSignerProvider('secp256k1-sha256').newInstance()]
  }
}

const transactionsRepository: IXyoProvider<IXyoRepository<IXyoHash, IXyoTransaction<any>>, undefined> = {
  async get() {
    const inMemoryRepo: {[s: string]: IXyoTransaction<any>} = {}

    const repo: IXyoRepository<IXyoHash, IXyoTransaction<any>> = {
      add: async (id, item) => {
        if (!inMemoryRepo[id.serializeHex()]) {
          inMemoryRepo[id.serializeHex()] = item
        }
        return
      },
      remove: async (id) => {
        delete inMemoryRepo[id.serializeHex()]
      },
      contains: async (id) => {
        return Boolean(inMemoryRepo[id.serializeHex()])
      },
      find: async (id) => {
        return inMemoryRepo[id.serializeHex()] || undefined
      }
    }

    return repo
  }
}

export const resolvers: IXyoResolvers = {
  [IResolvers.SIGNERS]: signersProvider,
  [IResolvers.SERIALIZATION_SERVICE]: serializationService,
  [IResolvers.HASH_PROVIDER]: hashProvider,
  [IResolvers.ORIGIN_CHAIN_REPOSITORY]: originChainRepository,
  [IResolvers.ORIGIN_BLOCK_REPOSITORY]: originBlockRepository,
  [IResolvers.BOUND_WITNESS_PAYLOAD_PROVIDER]: boundWitnessPayloadProvider,
  [IResolvers.BOUND_WITNESS_SUCCESS_LISTENER]: boundWitnessSuccessListener,
  [IResolvers.BOUND_WITNESS_VALIDATOR]: boundWitnessValidator,
  [IResolvers.NETWORK_PROCEDURE_CATALOGUE]: networkProcedureCatalogue,
  [IResolvers.NETWORK]: network,
  [IResolvers.PEER_CONNECTION_DELEGATE]: peerConnectionDelegate,
  [IResolvers.PEER_TRANSPORT]: peerTransport,
  [IResolvers.NODE_RUNNER_DELEGATE]: nodeRunnerDelegate,
  [IResolvers.NODE_NETWORK]: nodeNetwork,
  [IResolvers.P2P_SERVICE]: p2pService,
  [IResolvers.DISCOVERY_NETWORK]: discoveryNetwork,
  [IResolvers.TRANSACTION_REPOSITORY]: transactionsRepository
}
