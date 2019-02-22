/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 1:51:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 22nd February 2019 10:12:46 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-line-length

import { IXyoNodeRunnerDelegate } from '@xyo-network/node-runner'
import { IXyoResolvers, IXyoDiscoveryConfig, IXyoNodeNetworkConfig, IXyoPeerTransportConfig, IXyoNetworkConfig, IXyoNetworkProcedureCatalogueConfig, IXyoOriginChainConfig, IXyoAboutMeConfig, IXyoGraphQLConfig, IXyoWeb3ServiceConfig } from './@types'
import { IXyoPeerConnectionDelegate, XyoSimplePeerConnectionDelegate, XyoPeerConnectionHandler } from '@xyo-network/peer-connections'
import { IXyoNodeNetwork, XyoNodeNetwork } from '@xyo-network/node-network'
import { IXyoP2PService, IXyoPeerDiscoveryService, XyoP2PService, XyoPeerTransport, XyoPeerDiscoveryService, IXyoPeerTransport } from '@xyo-network/p2p'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { IXyoHashProvider, getHashingProvider, IXyoHash } from '@xyo-network/hashing'
import { IXyoOriginChainRepository, XyoOriginChainLocalStorageRepository } from '@xyo-network/origin-chain'
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
import { IXyoRepository, createDirectoryIfNotExists, IXyoProvider, XyoBaseInMemoryRepository } from '@xyo-network/utils'
import { IXyoTransaction } from '@xyo-network/transaction-pool'
import { IResolvers } from './xyo-resolvers-enum'
import { XyoLevelDbStorageProvider } from '@xyo-network/storage.leveldb'
import { buildGraphQLServer } from '@xyo-network/graphql-apis'
import { XyoAboutMeService } from '@xyo-network/about-me'
import { IXyoArchivistRepository } from '@xyo-network/archivist-repository'
import { createArchivistSqlRepository, ISqlConnectionDetails } from '@xyo-network/archivist-repository.sql'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { XyoGraphQLServer } from '@xyo-network/graphql-server'
import { IXyoArchivistNetwork, XyoArchivistNetwork } from '@xyo-network/archivist-network'
import { IXyoQuestionService, XyoQuestionService, IQuestionsProvider, QuestionsWorker } from '@xyo-network/questions'
import { XyoBlockPermissionRequestResolver } from '@xyo-network/attribution-request.node-network'
import { XyoWeb3Service } from '@xyo-network/web3-service'
import { Web3QuestionService } from '@xyo-network/web3-question-service'

const graphql: IXyoProvider<XyoGraphQLServer, IXyoGraphQLConfig> = {
  async get(container, config) {
    const graphqlServer = await buildGraphQLServer(config, container)
    await graphqlServer.start()
    return graphqlServer
  }
}

const nodeRunnerDelegates: IXyoProvider<IXyoNodeRunnerDelegate[], any> = {
  async get(container, config) {
    const delegates: IXyoNodeRunnerDelegate[] = []
    if (config.enableBoundWitnessServer) {
      const peerConnection = await container.get<IXyoPeerConnectionDelegate>(IResolvers.PEER_CONNECTION_DELEGATE)
      delegates.push({
        run: async () => {
          const networkPipe = await peerConnection.provideConnection()
          await peerConnection.handlePeerConnection(networkPipe)
        },
        onStop: async () => {
          return peerConnection.stopProvidingConnections()
        }
      })
    }

    const nodeNet = await container.get<IXyoNodeNetwork>(IResolvers.NODE_NETWORK) // this will initialize it

    if (config.enableGraphQLServer) {
      const graphqlServer = await container.get<XyoGraphQLServer>(IResolvers.GRAPHQL)
    }

    if (config.enableQuestionsWorker) {
      const questionsProv = await container.get<IQuestionsProvider>(IResolvers.QUESTIONS_PROVIDER)
      const questions = await container.get<IXyoQuestionService>(IResolvers.QUESTION_SERVICE)
      const qWorker = new QuestionsWorker(questionsProv, questions)
      delegates.push(qWorker)
    }

    return delegates
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
    const mutex = await originChainRepo.acquireMutex()
    if (!mutex) throw new XyoError(`Could not acquire mutex`, XyoErrors.CRITICAL)

    try {
      if (originChainSigners.length === 0) {
        const signers = await container.get<IXyoSigner[]>(IResolvers.SIGNERS)
        await originChainRepo.setCurrentSigners(signers, mutex)
      }

      const currentIndex = await originChainRepo.getIndex()
      if (currentIndex === 0) { // create genesis block
        const genesisBlock = await originChainRepo.createGenesisBlock()
        const successListener = await container.get<IXyoBoundWitnessSuccessListener>(IResolvers.BOUND_WITNESS_SUCCESS_LISTENER)
        await successListener.onBoundWitnessSuccess(genesisBlock, mutex)
      }
    } finally {
      await originChainRepo.releaseMutex(mutex)
    }

    return
  }
}

const originBlockRepository: IXyoProvider<IXyoOriginBlockRepository, undefined> = {
  async get(container) {
    try {
      const archivistRepo = await container.get<IXyoArchivistRepository>(IResolvers.ARCHIVIST_REPOSITORY)
      return archivistRepo
    } catch (err) {
      const storageProvider = new XyoInMemoryStorageProvider()
      const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)
      const hasher = await container.get<IXyoHashProvider>(IResolvers.HASH_PROVIDER)
      return new XyoOriginBlockRepository(storageProvider, serialization, hasher)
    }
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
    return new XyoBaseInMemoryRepository<IXyoHash, IXyoTransaction<any>>(k => k.serializeHex())
  }
}

const aboutMe: IXyoProvider<XyoAboutMeService, IXyoAboutMeConfig> = {
  async get(container, config) {
    const originChainRepo = await container.get<IXyoOriginChainRepository>(IResolvers.ORIGIN_CHAIN_REPOSITORY)
    const genesisSigner = await originChainRepo.getGenesisSigner()
    if (!genesisSigner) {
      throw new XyoError(`Could not get genesis signer from origin chain repo`, XyoErrors.CRITICAL)
    }

    const p2p = await container.get<IXyoP2PService>(IResolvers.P2P_SERVICE)
    return new XyoAboutMeService(
      config.ip,
      config.boundWitnessServerPort,
      config.graphqlPort,
      config.version,
      genesisSigner.publicKey,
      {
        get: async () => p2p.getPeers().map(p => p.address)
      },
      config.name
    )
  }
}

const archivistRepository: IXyoProvider<IXyoArchivistRepository, ISqlConnectionDetails> = {
  async get(container, config) {
    if (config && config.database && config.user && config.password && config.port && config.host) {
      const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)
      return createArchivistSqlRepository(config, serialization)
    }

    throw new XyoError(`Archivist repository lacks sql config, can not instantiate`, XyoErrors.CRITICAL)
  }
}

const archivistNetwork: IXyoProvider<IXyoArchivistNetwork, undefined> = {
  async get(container) {
    const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)
    const nodes = await container.get<IXyoNodeNetwork>(IResolvers.NODE_NETWORK)
    return new XyoArchivistNetwork(serialization, nodes)
  },
  async postInit(newInstance) {
    await newInstance.startFindingPeers()
  }
}

const questionService: IXyoProvider<IXyoQuestionService, undefined> = {
  async get(container) {
    const originBlockRepo = await container.get<IXyoOriginBlockRepository>(IResolvers.ORIGIN_BLOCK_REPOSITORY)
    const originChainRepo = await container.get<IXyoOriginChainRepository>(IResolvers.ORIGIN_CHAIN_REPOSITORY)
    const archivists = await container.get<IXyoArchivistNetwork>(IResolvers.ARCHIVIST_NETWORK)
    const nodes = await container.get<IXyoNodeNetwork>(IResolvers.NODE_NETWORK)
    const blockPermissionRequestResolver = new XyoBlockPermissionRequestResolver(nodes)

    return new XyoQuestionService(
      originBlockRepo,
      originChainRepo,
      archivists,
      blockPermissionRequestResolver
    )
  }
}

const web3Service: IXyoProvider<XyoWeb3Service, IXyoWeb3ServiceConfig> = {
  async get(container, config) {
    return new XyoWeb3Service(
      config.host,
      config.account,
      config.contracts
    )
  }
}

const questionsProvider: IXyoProvider<IQuestionsProvider, undefined> = {
  async get(container, config) {
    const web3 = await container.get<XyoWeb3Service>(IResolvers.WEB3_SERVICE)
    return new Web3QuestionService(web3)
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
  [IResolvers.NODE_RUNNER_DELEGATES]: nodeRunnerDelegates,
  [IResolvers.NODE_NETWORK]: nodeNetwork,
  [IResolvers.P2P_SERVICE]: p2pService,
  [IResolvers.DISCOVERY_NETWORK]: discoveryNetwork,
  [IResolvers.TRANSACTION_REPOSITORY]: transactionsRepository,
  [IResolvers.ABOUT_ME_SERVICE]: aboutMe,
  [IResolvers.ARCHIVIST_REPOSITORY]: archivistRepository,
  [IResolvers.ARCHIVIST_NETWORK]: archivistNetwork,
  [IResolvers.GRAPHQL]: graphql,
  [IResolvers.QUESTION_SERVICE]: questionService,
  [IResolvers.WEB3_SERVICE]: web3Service,
  [IResolvers.QUESTIONS_PROVIDER]: questionsProvider
}
