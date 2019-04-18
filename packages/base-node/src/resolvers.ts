/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 1:51:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th March 2019 4:03:18 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-line-length

import { IXyoResolvers, IXyoDiscoveryConfig, IXyoNodeNetworkConfig, IXyoPeerTransportConfig, IXyoNetworkConfig, IXyoNetworkProcedureCatalogueConfig, IXyoOriginChainConfig, IXyoAboutMeConfig, IXyoGraphQLConfig, IXyoWeb3ServiceConfig } from './@types'
import { IXyoPeerConnectionDelegate, XyoSimplePeerConnectionDelegate, XyoPeerConnectionHandler } from '@xyo-network/peer-connections'
import { IXyoNodeNetwork, XyoNodeNetwork } from '@xyo-network/node-network'
import { IXyoP2PService, IXyoPeerDiscoveryService, XyoP2PService, XyoPeerTransport, XyoPeerDiscoveryService, IXyoPeerTransport } from '@xyo-network/p2p'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { IXyoHashProvider, getHashingProvider } from '@xyo-network/hashing'
import { IXyoOriginChainRepository, XyoOriginChainLocalStorageRepository } from '@xyo-network/origin-chain'
import { IXyoOriginBlockRepository, XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessSuccessListener, XyoBoundWitnessPayloadProvider, XyoBoundWitnessSuccessListener, XyoBoundWitnessHandlerProvider, IXyoBoundWitnessInteractionFactory } from '@xyo-network/peer-interaction'
import { serializer } from '@xyo-network/serializer'
import { IXyoSigner } from '@xyo-network/signing'
import { XyoInMemoryStorageProvider, IXyoStorageProvider } from '@xyo-network/storage'
import { XyoBoundWitnessValidator, IXyoBoundWitnessValidationOptions } from '@xyo-network/bound-witness'
import { IXyoNetworkProvider, IXyoNetworkProcedureCatalogue, CatalogueItem, XyoNetworkProcedureCatalogue } from '@xyo-network/network'
import { XyoServerTcpNetwork } from '@xyo-network/network.tcp'
import { XyoPeerInteractionRouter } from '@xyo-network/peer-interaction-router'
import { XyoBoundWitnessInteraction, XyoBoundWitnessServerInteraction } from '@xyo-network/peer-interaction-handlers'
import { getSignerProvider } from '@xyo-network/signing.ecdsa'
import { createDirectoryIfNotExists, IXyoProvider, IXyoRunnable } from '@xyo-network/utils'
import { IXyoTransaction, IXyoTransactionRepository, XyoTransactionRepository } from '@xyo-network/transaction-pool'
import { IResolvers } from './xyo-resolvers-enum'
import { XyoLevelDbStorageProvider } from '@xyo-network/storage.leveldb'
import { buildGraphQLServer } from '@xyo-network/graphql-apis'
import { XyoAboutMeService } from '@xyo-network/about-me'
import { IXyoArchivistRepository } from '@xyo-network/archivist-repository'
import { createArchivistSqlRepository, ISqlArchivistRepositoryConfig } from '@xyo-network/archivist-repository-sql'
import { XyoError } from '@xyo-network/errors'
import { XyoGraphQLServer } from '@xyo-network/graphql-server'
import { IXyoArchivistNetwork, XyoArchivistNetwork } from '@xyo-network/archivist-network'
import { IXyoQuestionService, XyoQuestionService, IQuestionsProvider, QuestionsWorker } from '@xyo-network/questions'
import { XyoBlockPermissionRequestResolver } from '@xyo-network/attribution-request.node-network'
import { XyoWeb3Service } from '@xyo-network/web3-service'
import { Web3QuestionService } from '@xyo-network/web3-question-service'
import { XyoIpfsClient, XyoIpfsClientCtorOptions } from '@xyo-network/ipfs-client'
import { XyoScscConsensusProvider, IConsensusProvider } from '@xyo-network/consensus'
import { XyoBlockProducer } from '@xyo-network/block-producer'
import { XyoBlockWitness, XyoBlockWitnessValidator } from '@xyo-network/block-witness'
import { XyoGraphQLServerRunnable } from './runnables/xyo-graphql-server-runnable'
import { XyoBoundWitnessServerRunnable } from './runnables/xyo-bound-witness-server-runnable'
import { XyoNodeNetworkRunnable } from './runnables/xyo-node-network-runnable'
import { XyoQuestionsWorkerRunnable } from './runnables/xyo-questions-worker-runnable'
import { XyoBlockProducerRunnable } from './runnables/xyo-block-producer-runnable'
import { XyoBlockWitnessRunnable } from './runnables/xyo-block-witness-runnable'
import { IXyoContentAddressableService } from '@xyo-network/content-addressable-service'

const graphql: IXyoProvider<XyoGraphQLServer, IXyoGraphQLConfig> = {
  async get(container, config) {
    const graphqlServer = await buildGraphQLServer(config, container)
    return graphqlServer
  }
}

const runnables: IXyoProvider<IXyoRunnable[], any> = {
  async get(container, config) {
    const delegates: IXyoRunnable[] = []
    if (config.enableBoundWitnessServer) {
      const boundWitnessServer = new XyoBoundWitnessServerRunnable(
        async () => container.get<IXyoPeerConnectionDelegate>(IResolvers.PEER_CONNECTION_DELEGATE)
      )

      delegates.push(boundWitnessServer)
    }

    const nodes = await container.get<IXyoNodeNetwork>(IResolvers.NODE_NETWORK_FROM) // this will initialize it
    const nodeNet = new XyoNodeNetworkRunnable(async () => nodes)
    delegates.push(nodeNet)

    if (config.enableGraphQLServer) {
      const gqlServer = await container.get<XyoGraphQLServer>(IResolvers.GRAPHQL)
      const gql = new XyoGraphQLServerRunnable(async () => gqlServer)
      delegates.push(gql)
    }

    if (config.enableQuestionsWorker) {
      const questionsProv = await container.get<IQuestionsProvider>(IResolvers.QUESTIONS_PROVIDER)
      const questions = await container.get<IXyoQuestionService>(IResolvers.QUESTION_SERVICE)
      const transactionRepo = await container.get<IXyoTransactionRepository>(IResolvers.TRANSACTION_REPOSITORY)
      const hasher = await container.get<IXyoHashProvider>(IResolvers.HASH_PROVIDER)

      const questionsDaemon = new XyoQuestionsWorkerRunnable(async () => {
        return new QuestionsWorker(
          questionsProv,
          questions,
          transactionRepo,
          nodes,
          hasher
        )
      })

      delegates.push(questionsDaemon)
    }

    if (config.enableBlockProducer) {
      const producer = await container.get<XyoBlockProducer>(IResolvers.BLOCK_PRODUCER)
      const blockProducerDaemon = new XyoBlockProducerRunnable(async() => producer)

      delegates.push(blockProducerDaemon)
    }

    if (config.enableBlockWitness) {
      const witness = await container.get<XyoBlockWitness>(IResolvers.BLOCK_WITNESS)
      const blockWitnessDaemon = new XyoBlockWitnessRunnable(async () => witness)
      delegates.push(blockWitnessDaemon)
    }

    return delegates
  }
}

const blockProducer: IXyoProvider<XyoBlockProducer, any> = {
  async get(container, config) {
    const consensus = await container.get<IConsensusProvider>(IResolvers.CONSENSUS_PROVIDER)
    const nodes = await container.get<IXyoNodeNetwork>(IResolvers.NODE_NETWORK_FROM)
    const hasher = getHashingProvider('sha3')
    const transactionRepository = await container.get<IXyoTransactionRepository>(IResolvers.TRANSACTION_REPOSITORY)
    const contentService = await container.get<IXyoContentAddressableService>(
      IResolvers.CONTENT_ADDRESSABLE_SERVICE
    )
    const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)
    const validator = await container.get<XyoBoundWitnessValidator>(IResolvers.BOUND_WITNESS_VALIDATOR)

    return new XyoBlockProducer(
      consensus,
      config.accountAddress,
      transactionRepository,
      hasher,
      nodes,
      contentService,
      new XyoBlockWitnessValidator(
        contentService,
        serialization,
        hasher,
        validator,
        consensus
      )
    )
  }
}

const blockWitness: IXyoProvider<XyoBlockWitness, any> = {
  async get(container, config) {
    const consensus = await container.get<IConsensusProvider>(IResolvers.CONSENSUS_PROVIDER)
    const nodes = await container.get<IXyoNodeNetwork>(IResolvers.NODE_NETWORK_FROM)

    return new XyoBlockWitness(nodes, consensus)
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
    const transactionRepository = await container.get<IXyoTransactionRepository>(IResolvers.TRANSACTION_REPOSITORY)

    const contentService = await container.get<IXyoContentAddressableService>(
      IResolvers.CONTENT_ADDRESSABLE_SERVICE
    )

    const validator = await container.get<XyoBoundWitnessValidator>(IResolvers.BOUND_WITNESS_VALIDATOR)
    const consensus = await (config.features.diviner && config.features.diviner.supportsFeature ?
      container.get<IConsensusProvider>(IResolvers.CONSENSUS_PROVIDER) :
      Promise.resolve(undefined))

    const blockWitnessValidator = consensus ? new XyoBlockWitnessValidator(
      contentService,
      serialization,
      hasher,
      validator,
      consensus
    ) : undefined

    const networkService = new XyoNodeNetwork(
      p2p,
      serialization,
      {
        blockWitnessValidator,
        payloadProvider,
        transactionsRepository: transactionRepository,
        boundWitnessSuccessListener: boundWitnessSuccess,
        originChainRepository: originChainRepo,
        originBlockRepository: originBlockRepo,
        hashProvider: hasher
      }
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
  async get(container, c) {
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
    const db = await XyoLevelDbStorageProvider.createStore(config.data)
    return new XyoOriginChainLocalStorageRepository(db, originBlockRepo, serialization)
  },
  async postInit(originChainRepo, container, c) {
    const originChainSigners = await originChainRepo.getSigners()
    const mutex = await originChainRepo.acquireMutex()
    if (!mutex) throw new XyoError(`Could not acquire mutex`)

    try {
      if (originChainSigners.length === 0) {
        const signers = await container.get<IXyoSigner[]>(IResolvers.SIGNERS)
        await originChainRepo.setCurrentSigners(signers, mutex)
      }

      const currentIndex = await originChainRepo.getIndex()
      if (currentIndex === 0) { // create genesis block
        const genesisBlock = await originChainRepo.createGenesisBlock()
        const successListener = await container.get<IXyoBoundWitnessSuccessListener>(IResolvers.BOUND_WITNESS_SUCCESS_LISTENER)
        await successListener.onBoundWitnessSuccess(genesisBlock, mutex, CatalogueItem.BOUND_WITNESS)
      }
    } finally {
      await originChainRepo.releaseMutex(mutex)
    }

    return
  }
}

const originBlockRepository: IXyoProvider<IXyoOriginBlockRepository, undefined> = {
  async get(container, c) {
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
  async get(container, config) {
    return new XyoBoundWitnessPayloadProvider()
  }
}

const boundWitnessSuccessListener: IXyoProvider<IXyoBoundWitnessSuccessListener, undefined> = {
  async get(container, c) {
    const hasher = await container.get<IXyoHashProvider>(IResolvers.HASH_PROVIDER)
    const originBlockRepo = await container.get<IXyoOriginBlockRepository>(IResolvers.ORIGIN_BLOCK_REPOSITORY)
    const validator = await container.get<XyoBoundWitnessValidator>(IResolvers.BOUND_WITNESS_VALIDATOR)
    const originChainRepo = await container.get<IXyoOriginChainRepository>(IResolvers.ORIGIN_CHAIN_REPOSITORY)
    const contentService = await container.get<IXyoContentAddressableService>(
      IResolvers.CONTENT_ADDRESSABLE_SERVICE
    )
    return new XyoBoundWitnessSuccessListener(
      hasher,
      validator,
      originChainRepo,
      originBlockRepo,
      contentService
    )
  }
}

const boundWitnessValidator: IXyoProvider<XyoBoundWitnessValidator, IXyoBoundWitnessValidationOptions> = {
  async get(container, config) {
    return new XyoBoundWitnessValidator(config)
  }
}

const peerConnectionDelegate: IXyoProvider<IXyoPeerConnectionDelegate, undefined> = {
  async get(container, c) {
    const networkService = await container.get<IXyoNetworkProvider>(IResolvers.NETWORK)
    const catalogue = await container.get<IXyoNetworkProcedureCatalogue>(IResolvers.NETWORK_PROCEDURE_CATALOGUE)
    const peerInteractionRouter = new XyoPeerInteractionRouter()
    const originStateRepository = await container.get<IXyoOriginChainRepository>(IResolvers.ORIGIN_CHAIN_REPOSITORY)
    const boundWitnessPayload = await container.get<IXyoBoundWitnessPayloadProvider>(IResolvers.BOUND_WITNESS_PAYLOAD_PROVIDER)
    const boundWitnessSuccess = await container.get<IXyoBoundWitnessSuccessListener>(IResolvers.BOUND_WITNESS_SUCCESS_LISTENER)
    const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)

    const standardServerInteractionFactory: IXyoBoundWitnessInteractionFactory = {
      newInstance: (signers, payload) =>  {
        return new XyoBoundWitnessInteraction(
          signers,
          payload,
          serialization,
          CatalogueItem.BOUND_WITNESS
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
        return new XyoBoundWitnessInteraction(
          signers,
          payload,
          serialization,
          CatalogueItem.TAKE_ORIGIN_CHAIN
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

const transactionsRepository: IXyoProvider<IXyoTransactionRepository, any> = {
  async get(container, config) {
    await createDirectoryIfNotExists(config.data)
    const transactionDb = await XyoLevelDbStorageProvider.createStore(config.data)
    return new XyoTransactionRepository(transactionDb)
  }
}

const aboutMe: IXyoProvider<XyoAboutMeService, IXyoAboutMeConfig> = {
  async get(container, config) {
    const originChainRepo = await container.get<IXyoOriginChainRepository>(IResolvers.ORIGIN_CHAIN_REPOSITORY)
    const genesisSigner = await originChainRepo.getGenesisSigner()
    if (!genesisSigner) {
      throw new XyoError(`Could not get genesis signer from origin chain repo`)
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

const archivistRepository: IXyoProvider<IXyoArchivistRepository, ISqlArchivistRepositoryConfig> = {
  async get(container, config) {
    if (config && config.database && config.user && config.password && config.port && config.host) {
      const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)
      return createArchivistSqlRepository(config, serialization)
    }

    throw new XyoError(`Archivist repository lacks sql config, can not instantiate`)
  }
}

const archivistNetwork: IXyoProvider<IXyoArchivistNetwork, undefined> = {
  async get(container, c) {
    const serialization = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)
    const nodes = await container.get<IXyoNodeNetwork>(IResolvers.NODE_NETWORK_FROM)
    return new XyoArchivistNetwork(serialization, nodes)
  },
  async postInit(newInstance) {
    await newInstance.startFindingPeers()
  }
}

const questionService: IXyoProvider<IXyoQuestionService, undefined> = {
  async get(container, c) {
    const originBlockRepo = await container.get<IXyoOriginBlockRepository>(IResolvers.ORIGIN_BLOCK_REPOSITORY)
    const originChainRepo = await container.get<IXyoOriginChainRepository>(IResolvers.ORIGIN_CHAIN_REPOSITORY)
    const archivists = await container.get<IXyoArchivistNetwork>(IResolvers.ARCHIVIST_NETWORK)
    const nodes = await container.get<IXyoNodeNetwork>(IResolvers.NODE_NETWORK_FROM)
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
    const contentService = await container.get<IXyoContentAddressableService>(
      IResolvers.CONTENT_ADDRESSABLE_SERVICE
    )
    return new XyoWeb3Service(
      config.host,
      contentService,
      config.contracts,
      config.address,
      config.privateKey
    )
  }
}

const consensusProvider: IXyoProvider<IConsensusProvider, undefined> = {
  async get(container, config) {
    const web3 = await container.get<XyoWeb3Service>(IResolvers.WEB3_SERVICE)
    return new XyoScscConsensusProvider(web3)
  }
}

const questionsProvider: IXyoProvider<IQuestionsProvider, undefined> = {
  async get(container, config) {
    const consensus = await container.get<IConsensusProvider>(IResolvers.CONSENSUS_PROVIDER)
    const contentService = await container.get<IXyoContentAddressableService>(
      IResolvers.CONTENT_ADDRESSABLE_SERVICE
    )
    return new Web3QuestionService(consensus, contentService)
  }
}

const contentAddressableService: IXyoProvider<IXyoContentAddressableService, XyoIpfsClientCtorOptions> = {
  async get(container, config) {
    const client = new XyoIpfsClient(config)
    return client
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
  [IResolvers.RUNNABLES]: runnables,
  [IResolvers.NODE_NETWORK_FROM]: nodeNetwork,
  [IResolvers.P2P_SERVICE]: p2pService,
  [IResolvers.DISCOVERY_NETWORK]: discoveryNetwork,
  [IResolvers.TRANSACTION_REPOSITORY]: transactionsRepository,
  [IResolvers.ABOUT_ME_SERVICE]: aboutMe,
  [IResolvers.ARCHIVIST_REPOSITORY]: archivistRepository,
  [IResolvers.ARCHIVIST_NETWORK]: archivistNetwork,
  [IResolvers.GRAPHQL]: graphql,
  [IResolvers.QUESTION_SERVICE]: questionService,
  [IResolvers.WEB3_SERVICE]: web3Service,
  [IResolvers.QUESTIONS_PROVIDER]: questionsProvider,
  [IResolvers.CONSENSUS_PROVIDER]: consensusProvider,
  [IResolvers.CONTENT_ADDRESSABLE_SERVICE]: contentAddressableService,
  [IResolvers.BLOCK_PRODUCER]: blockProducer,
  [IResolvers.BLOCK_WITNESS]: blockWitness
}
