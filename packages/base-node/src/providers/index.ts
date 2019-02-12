/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 1:51:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 12th February 2019 10:38:02 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-line-length

import { IXyoNodeRunnerDelegate } from '@xyo-network/node-runner'
import { IXyoProvider } from '../@types'
import { IXyoPeerConnectionDelegate, XyoSimplePeerConnectionDelegate, XyoPeerConnectionHandler } from '@xyo-network/peer-connections'
import { IXyoNodeNetwork, XyoNodeNetwork } from '@xyo-network/node-network'
import { IXyoP2PService, IXyoPeerDiscoveryService, XyoP2PService, XyoPeerTransport, XyoPeerDiscoveryService } from '@xyo-network/p2p'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { IXyoHashProvider, getHashingProvider, IXyoHash } from '@xyo-network/hashing'
import { IXyoOriginChainRepository, XyoOriginChainStateInMemoryRepository } from '@xyo-network/origin-chain'
import { IXyoOriginBlockRepository, XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessSuccessListener, XyoBoundWitnessPayloadProvider, XyoBoundWitnessSuccessListener, XyoBoundWitnessHandlerProvider, IXyoBoundWitnessInteractionFactory } from '@xyo-network/peer-interaction'
import { serializer } from '@xyo-network/serializer'
import { IXyoSigner, IXyoPublicKey } from '@xyo-network/signing'
import { XyoInMemoryStorageProvider } from '@xyo-network/storage'
import { XyoBoundWitnessValidator, IXyoBoundWitnessValidationOptions } from '@xyo-network/bound-witness'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoNetworkProvider, IXyoNetworkProcedureCatalogue, CatalogueItem } from '@xyo-network/network'
import { XyoServerTcpNetwork } from '@xyo-network/network.tcp'
import { XyoPeerInteractionRouter } from '@xyo-network/peer-interaction-router'
import { XyoBoundWitnessTakeOriginChainServerInteraction, XyoBoundWitnessStandardServerInteraction } from '@xyo-network/peer-interaction-handlers'
import { getSignerProvider } from '@xyo-network/signing.ecdsa'
import { IXyoRepository } from '@xyo-network/utils'
import { IXyoTransaction } from '@xyo-network/transaction-pool'

const nodeRunnerDelegateProvider: IXyoProvider<IXyoNodeRunnerDelegate> = {
  async get(container) {
    const peerConnectionDelegate = await container.get<IXyoPeerConnectionDelegate>(`IXyoPeerConnectionDelegate`)
    return {
      run: async () => {
        const networkPipe = await peerConnectionDelegate.provideConnection()
        return peerConnectionDelegate.handlePeerConnection(networkPipe)
      },
      onStop: async () => {
        return peerConnectionDelegate.stopProvidingConnections()
      }
    }
  }
}

const nodeNetworkProvider: IXyoProvider<IXyoNodeNetwork> = {
  async get(container) {
    const p2pService = await container.get<IXyoP2PService>(`IXyoP2PService`)
    const serializationService = await container.get<IXyoSerializationService>(`IXyoSerializationService`)
    const hasher = await container.get<IXyoHashProvider>(`IXyoHashProvider`)
    const originChainRepository = await container.get<IXyoOriginChainRepository>(`IXyoOriginChainRepository`)
    const originBlockRepository = await container.get<IXyoOriginBlockRepository>(`IXyoOriginBlockRepository`)
    const payloadProvider = await container.get<IXyoBoundWitnessPayloadProvider>(`IXyoBoundWitnessPayloadProvider`)
    const boundWitnessSuccessListener = await container.get<IXyoBoundWitnessSuccessListener>(`IXyoBoundWitnessSuccessListener`)
    const transactionRepository = await container.get<IXyoRepository<IXyoHash, IXyoTransaction<any>>>(`TransactionRepository`)
    const network = new XyoNodeNetwork(
      p2pService,
      serializationService,
      hasher,
      originBlockRepository,
      originChainRepository,
      payloadProvider,
      boundWitnessSuccessListener,
      transactionRepository
    )

    return network
  }
}

const p2PServiceProvider: IXyoProvider<IXyoP2PService> = {
  async get(container) {
    const discoveryNetwork = await container.get<IXyoPeerDiscoveryService>(`IXyoPeerDiscoveryService`)
    return new XyoP2PService(discoveryNetwork)
  }
}

const discoveryNetworkProvider: IXyoProvider<IXyoPeerDiscoveryService> = {
  async get(container) {
    const discoveryPublicKey = await container.get<IXyoPublicKey>(`discoveryNetworkPublicKey`)
    const p2pAddress = await container.get<string>(`p2PAddress`)
    const peerTransport = new XyoPeerTransport(p2pAddress)
    return new XyoPeerDiscoveryService(discoveryPublicKey.serializeHex(), p2pAddress, peerTransport)
  }
}

const discoveryNetworkPublicKeyProvider: IXyoProvider<IXyoPublicKey> = {
  async get(container) {
    const signers = await container.get<IXyoSigner[]>(`signers`)
    if (!signers || signers.length === 0) {
      throw new XyoError('Signers must have at least item to initialize discovery service', XyoErrors.CRITICAL)
    }

    return signers[0].publicKey
  }
}

const p2pAddressProvider: IXyoProvider<string> = {
  async get(container) {
    return '/ip4/0.0.0.0/tcp/11500'
  }
}

const serializationServiceProvider: IXyoProvider<IXyoSerializationService> = {
  async get(container) {
    return serializer
  }
}

const hashProvider: IXyoProvider<IXyoHashProvider> = {
  async get(container) {
    return getHashingProvider('sha256')
  }
}

const originChainRepositoryProvider: IXyoProvider<IXyoOriginChainRepository> = {
  async get(container) {
    const signers = await container.get<IXyoSigner[]>(`signers`)
    const originBlockRepository = await container.get<IXyoOriginBlockRepository>(`IXyoOriginBlockRepository`)
    const serializationService = await container.get<IXyoSerializationService>(`IXyoSerializationService`)

    return new XyoOriginChainStateInMemoryRepository(
        0, // index
        [], // hashes
        [], // public keys
        originBlockRepository,
        signers,
        undefined, // next-public-key
        [], // waiting signers
        serializationService,
        undefined // genesis signer
      )
  }
}

const originBlockRepositoryProvider: IXyoProvider<IXyoOriginBlockRepository> = {
  async get(container) {
    const storageProvider = new XyoInMemoryStorageProvider()
    const serializationService = await container.get<IXyoSerializationService>(`IXyoSerializationService`)
    const hasher = await container.get<IXyoHashProvider>(`IXyoHashProvider`)
    return new XyoOriginBlockRepository(storageProvider, serializationService, hasher)
  }
}

const boundWitnessPayloadProviderProvider: IXyoProvider<IXyoBoundWitnessPayloadProvider> = {
  async get(container) {
    return new XyoBoundWitnessPayloadProvider()
  }
}

const boundWitnessSuccessListenerProvider: IXyoProvider<IXyoBoundWitnessSuccessListener> = {
  async get(container) {
    const hasher = await container.get<IXyoHashProvider>(`IXyoHashProvider`)
    const originBlockRepository = await container.get<IXyoOriginBlockRepository>(`IXyoOriginBlockRepository`)
    const boundWitnessValidator = await container.get<XyoBoundWitnessValidator>(`XyoBoundWitnessValidator`)
    const originChainRepository = await container.get<IXyoOriginChainRepository>(`IXyoOriginChainRepository`)

    return new XyoBoundWitnessSuccessListener(
      hasher,
      boundWitnessValidator,
      originChainRepository,
      originBlockRepository
    )
  }
}

const boundWitnessValidatorProvider: IXyoProvider<XyoBoundWitnessValidator> = {
  async get(container) {
    const boundWitnessValidationOptions = await container.get<IXyoBoundWitnessValidationOptions>(`IXyoBoundWitnessValidationOptions`)
    return new XyoBoundWitnessValidator(boundWitnessValidationOptions)
  }
}

const boundWitnessValidationOptionsProvider: IXyoProvider<IXyoBoundWitnessValidationOptions> = {
  async get(container) {
    return {
      checkPartyLengths: true,
      checkIndexExists: true,
      checkCountOfSignaturesMatchPublicKeysCount: true,
      validateSignatures: true,
      validateHash: true
    }
  }
}

const peerConnectionDelegateProvider: IXyoProvider<IXyoPeerConnectionDelegate> = {
  async get(container) {
    const network = await container.get<IXyoNetworkProvider>(`IXyoNetworkProvider`)
    const catalogue = await container.get<IXyoNetworkProcedureCatalogue>(`IXyoNetworkProcedureCatalogue`)
    const peerInteractionRouter = new XyoPeerInteractionRouter()
    const originStateRepository = await container.get<IXyoOriginChainRepository>(`IXyoOriginChainRepository`)
    const boundWitnessPayloadProvider = await container.get<IXyoBoundWitnessPayloadProvider>(`IXyoBoundWitnessPayloadProvider`)
    const boundWitnessSuccessListener = await container.get<IXyoBoundWitnessSuccessListener>(`IXyoBoundWitnessSuccessListener`)
    const serializationService = await container.get<IXyoSerializationService>(`IXyoSerializationService`)

    const standardServerInteractionFactory: IXyoBoundWitnessInteractionFactory =         {
      newInstance: (signers, payload) =>  {
        return new XyoBoundWitnessStandardServerInteraction(
          signers,
          payload,
          serializationService
        )
      }
    }

    const standardBoundWitnessHandlerProvider = new XyoBoundWitnessHandlerProvider(
      originStateRepository,
      boundWitnessPayloadProvider,
      boundWitnessSuccessListener,
      standardServerInteractionFactory
    )

    const takeOriginChainServerInteractionFactory: IXyoBoundWitnessInteractionFactory = {
      newInstance: (signers, payload) =>  {
        return new XyoBoundWitnessTakeOriginChainServerInteraction(
          signers,
          payload,
          serializationService
        )
      }
    }

    const takeOriginChainBoundWitnessHandlerProvider =  new XyoBoundWitnessHandlerProvider(
      originStateRepository,
      boundWitnessPayloadProvider,
      boundWitnessSuccessListener,
      takeOriginChainServerInteractionFactory
    )

    // Routes
    peerInteractionRouter.use(CatalogueItem.BOUND_WITNESS, () => {
      return standardBoundWitnessHandlerProvider
    })

    peerInteractionRouter.use(CatalogueItem.TAKE_ORIGIN_CHAIN, () => {
      return takeOriginChainBoundWitnessHandlerProvider
    })

    const peerConnectionHandler = new XyoPeerConnectionHandler(peerInteractionRouter, peerInteractionRouter)

    return new XyoSimplePeerConnectionDelegate(network, catalogue, peerConnectionHandler)
  }
}

const networkProvider: IXyoProvider<IXyoNetworkProvider> = {
  async get(container) {
    const boundWitnessServerPort = await container.get<number>(`boundWitnessServerPort`)
    return new XyoServerTcpNetwork(boundWitnessServerPort)
  }
}

const boundWitnessServerPortProvider: IXyoProvider<number> = {
  async get(container) {
    return 11000
  }
}

const networkProcedureCatalogueProvider: IXyoProvider<IXyoNetworkProcedureCatalogue> = {
  async get(container) {
    const catalogue = await container.get<CatalogueItem[]>(`boundWitnessCatalogue`)
    return {
      canDo(catalogueItem: CatalogueItem) {
        return catalogue.indexOf(catalogueItem) > -1
      },
      getCurrentCatalogue() {
        return catalogue
      }
    }
  }
}

const boundWitnessCatalogueProvider: IXyoProvider<CatalogueItem[]> = {
  async get(container) {
    return [
      CatalogueItem.BOUND_WITNESS,
      CatalogueItem.GIVE_ORIGIN_CHAIN
    ]
  }
}

const signersProvider: IXyoProvider<IXyoSigner[]> = {
  async get(container) {
    return [getSignerProvider('secp256k1-sha256').newInstance()]
  }
}

const transactionsRepository: IXyoRepository<IXyoHash, IXyoTransaction<any>> =  (() => {
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
})()

export const providers = {
  signersProvider,
  serializationServiceProvider,
  hashProvider,
  originChainRepositoryProvider,
  originBlockRepositoryProvider,
  boundWitnessPayloadProviderProvider,
  boundWitnessSuccessListenerProvider,
  boundWitnessValidatorProvider,
  boundWitnessValidationOptionsProvider,
  boundWitnessCatalogueProvider,
  networkProcedureCatalogueProvider,
  boundWitnessServerPortProvider,
  networkProvider,
  peerConnectionDelegateProvider,
  nodeRunnerDelegateProvider,
  nodeNetworkProvider,
  p2PServiceProvider,
  discoveryNetworkProvider,
  discoveryNetworkPublicKeyProvider,
  p2pAddressProvider,
  transactionsRepository
}
