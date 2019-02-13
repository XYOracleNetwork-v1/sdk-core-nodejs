/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 11:39:13 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th February 2019 1:29:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import { XyoNodeRunner, IXyoNodeRunnerDelegate } from '@xyo-network/node-runner'
import { IXyoNetworkProvider, IXyoNetworkProcedureCatalogue, CatalogueItem } from '@xyo-network/network'
import { XyoServerTcpNetwork } from '@xyo-network/network.tcp'
import { XyoSimplePeerConnectionDelegate, IXyoPeerConnectionDelegate, IXyoPeerConnectionHandler, XyoPeerConnectionHandler } from '@xyo-network/peer-connections'
import { XyoPeerInteractionRouter } from '@xyo-network/peer-interaction-router'
import { XyoBoundWitnessStandardServerInteraction, XyoBoundWitnessTakeOriginChainServerInteraction } from '@xyo-network/peer-interaction-handlers'
import { IXyoHashProvider, getHashingProvider, IXyoHash } from '@xyo-network/hashing'
import { getSignerProvider } from '@xyo-network/signing.ecdsa'

import {
  XyoBoundWitnessHandlerProvider,
  IXyoBoundWitnessPayloadProvider,
  IXyoBoundWitnessSuccessListener,
  XyoNestedBoundWitnessExtractor,
  XyoBoundWitnessPayloadProvider,
  IXyoBoundWitnessInteractionFactory,
  XyoBoundWitnessSuccessListener
} from '@xyo-network/peer-interaction'

import {
  IXyoOriginChainRepository,
  XyoOriginChainStateInMemoryRepository
} from '@xyo-network/origin-chain'

import { IXyoOriginBlockRepository, XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import {
  XyoBoundWitnessValidator
} from '@xyo-network/bound-witness'

import { IXyoSerializationService } from '@xyo-network/serialization'
import { XyoInMemoryStorageProvider } from '@xyo-network/storage'
import { IXyoSigner, IXyoPublicKey } from '@xyo-network/signing'
import { serializer } from '@xyo-network/serializer'
import { IXyoNodeNetwork, XyoNodeNetwork, IXyoComponentFeatureResponse } from '@xyo-network/node-network'
import { IXyoP2PService, XyoP2PService, IXyoPeerDiscoveryService, XyoPeerDiscoveryService, XyoPeerTransport } from '@xyo-network/p2p'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoRepository } from '@xyo-network/utils'
import { IXyoTransaction } from '@xyo-network/transaction-pool'

// tslint:disable-next-line:max-classes-per-file
export class XyoBaseNode extends XyoBase {

  protected nodeRunner: XyoNodeRunner | undefined

  public async start(): Promise<void> {
    // Setup origin-chain
    await this.configureOriginChainStateRepository()

    // Set up and start the node-runner
    const delegate = await this.getNodeRunnerDelegate()
    this.nodeRunner = new XyoNodeRunner(delegate)
    await this.nodeRunner.start()

    // Start P2P service and node-network
    const discoveryNetwork = await this.getDiscoveryNetwork()
    await discoveryNetwork.start()
    const bootstrapNodes = await this.getDiscoveryBootstrapNodes()
    await discoveryNetwork.addBootstrapNodes(bootstrapNodes)
    await this.getNodeNetwork()
  }

  public async stop(): Promise<boolean> {
    if (this.nodeRunner) {
      await this.nodeRunner.stop()
      return true
    }

    return false
  }

  protected async getNodeRunnerDelegate(): Promise<IXyoNodeRunnerDelegate> {
    return this.getOrCreate(`IXyoNodeRunnerDelegate`, async () => {
      const peerConnectionDelegate = await this.getPeerConnectionDelegate()
      return {
        run: async () => {
          const networkPipe = await peerConnectionDelegate.provideConnection()
          return peerConnectionDelegate.handlePeerConnection(networkPipe)
        },
        onStop: async () => {
          return peerConnectionDelegate.stopProvidingConnections()
        }
      }
    })
  }

  protected async getNodeNetwork(): Promise<IXyoNodeNetwork> {
    return this.getOrCreate(`IXyoNodeNetwork`, async () => {
      const p2pService = await this.getP2PService()
      const serializationService = await this.getSerializationService()
      const hashProvider = await this.getHashingProvider()
      const originChainRepository = await this.getOriginStateRepository()
      const originBlockRepository = await this.getOriginBlockRepository()
      const payloadProvider = await this.getBoundWitnessPayloadProvider()
      const boundWitnessSuccessListener = await this.getBoundWitnessSuccessListener()
      const transactionRepository = await this.getTransactionRepository()

      const network = new XyoNodeNetwork(
        p2pService,
        serializationService,
        hashProvider,
        originBlockRepository,
        originChainRepository,
        payloadProvider,
        boundWitnessSuccessListener,
        transactionRepository
      )

      const features = await this.getNodeFeatures()
      network.setFeatures(features)
      if (this.shouldServiceBlockPermissionRequests()) {
        network.serviceBlockPermissionRequests()
      }

      return network
    })
  }

  protected async getTransactionRepository(): Promise<IXyoRepository<IXyoHash, IXyoTransaction<any>>> {
    return this.getOrCreate(`TransactionRepository`, async () => {
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
    })
  }

  protected async shouldServiceBlockPermissionRequests() {
    return false
  }

  protected async getNodeFeatures(): Promise<IXyoComponentFeatureResponse> {
    return this.getOrCreate('IXyoComponentFeatureResponse', async () => {
      return {}
    })
  }

  protected async getP2PService(): Promise<IXyoP2PService> {
    return this.getOrCreate(`IXyoP2PService`, async () => {
      const discoveryNetwork = await this.getDiscoveryNetwork()
      return new XyoP2PService(discoveryNetwork)
    })
  }

  protected async getDiscoveryNetwork(): Promise<IXyoPeerDiscoveryService> {
    return this.getOrCreate(`IXyoPeerDiscoveryService`, async () => {
      const discoveryPublicKey = await this.getDiscoveryNetworkPublicKey()
      const p2pAddress = await this.getP2PAddress()
      const peerTransport = new XyoPeerTransport()
      peerTransport.initialize(p2pAddress)

      const discoveryService = new XyoPeerDiscoveryService(peerTransport)
      discoveryService.initialize({ publicKey: discoveryPublicKey.serializeHex(), address: p2pAddress })
      return discoveryService
    })
  }

  protected async getDiscoveryBootstrapNodes(): Promise<string[]> {
    return this.getOrCreate('DiscoveryBootstrapNodes', async () => {
      return []
    })
  }

  protected async getDiscoveryNetworkPublicKey(): Promise<IXyoPublicKey> {
    return this.getOrCreate(`DiscoveryNetworkPublicKey`, async () => {
      const signers = await this.getSigners()
      if (signers.length === 0) {
        throw new XyoError('Signers must have at least item to initialize discovery service', XyoErrors.CRITICAL)
      }

      return signers[0].publicKey
    })
  }

  protected async getP2PAddress(): Promise<string> {
    return this.getOrCreate(`P2PAddress`, async () => {
      return '/ip4/0.0.0.0/tcp/11500'
    })
  }

  protected async getPeerConnectionDelegate(): Promise<IXyoPeerConnectionDelegate> {
    return this.getOrCreate('IXyoPeerConnectionDelegate', async () => {
      const network = await this.getNetwork()
      const catalogue = await this.getCatalogue()
      const peerConnectionHandler = await this.getPeerConnectionHandler()

      return new XyoSimplePeerConnectionDelegate(network, catalogue, peerConnectionHandler)
    })
  }

  protected async getNetwork(): Promise<IXyoNetworkProvider> {
    return this.getOrCreate('IXyoNetworkProvider', async () => {
      const nodePort = await this.getNodePort()
      return new XyoServerTcpNetwork(nodePort)
    })
  }

  protected getNodePort(): number {
    return 11000
  }

  protected async getCatalogue(): Promise<IXyoNetworkProcedureCatalogue> {
    return this.getOrCreate('IXyoNetworkProcedureCatalogue', async () => {
      return {
        canDo(catalogueItem: CatalogueItem) {
          return catalogueItem === CatalogueItem.BOUND_WITNESS || catalogueItem === CatalogueItem.GIVE_ORIGIN_CHAIN
        },
        getCurrentCatalogue() {
          return [
            CatalogueItem.BOUND_WITNESS,
            CatalogueItem.GIVE_ORIGIN_CHAIN
          ]
        },
        setCatalogue() {
          return // not implemented
        }
      }
    })
  }

  protected async getPeerConnectionHandler(): Promise<IXyoPeerConnectionHandler> {
    return this.getOrCreate('IXyoPeerConnectionHandler', async () => {
      const peerInteractionRouter = await this.getPeerInteractionRouter()
      return new XyoPeerConnectionHandler(peerInteractionRouter, peerInteractionRouter)
    })
  }

  protected async getPeerInteractionRouter(): Promise<XyoPeerInteractionRouter> {
    return this.getOrCreate('XyoPeerInteractionRouter', async () => {
      const peerInteractionRouter = new XyoPeerInteractionRouter()
      const standardBoundWitnessHandlerProvider = await this.getStandardBoundWitnessHandlerProvider()
      const takeOriginChainBoundWitnessHandlerProvider = await this.getTakeOriginChainBoundWitnessHandlerProvider()

      // Routes
      peerInteractionRouter.use(CatalogueItem.BOUND_WITNESS, () => {
        return standardBoundWitnessHandlerProvider
      })

      peerInteractionRouter.use(CatalogueItem.TAKE_ORIGIN_CHAIN, () => {
        return takeOriginChainBoundWitnessHandlerProvider
      })

      return peerInteractionRouter
    })
  }

  protected async getStandardBoundWitnessHandlerProvider(): Promise<XyoBoundWitnessHandlerProvider> {
    return this.getOrCreate('XyoStandardBoundWitnessHandlerProvider', async () => {
      const originStateRepository = await this.getOriginStateRepository()
      const boundWitnessPayloadProvider = await this.getBoundWitnessPayloadProvider()
      const boundWitnessSuccessListener = await this.getBoundWitnessSuccessListener()
      const serializationService = await this.getSerializationService()

      const standardServerInteractionFactory: IXyoBoundWitnessInteractionFactory =         {
        newInstance: (signers, payload) =>  {
          return new XyoBoundWitnessStandardServerInteraction(
            signers,
            payload,
            serializationService
          )
        }
      }

      return new XyoBoundWitnessHandlerProvider(
        originStateRepository,
        boundWitnessPayloadProvider,
        boundWitnessSuccessListener,
        standardServerInteractionFactory
      )
    })
  }

  protected async getTakeOriginChainBoundWitnessHandlerProvider(): Promise<XyoBoundWitnessHandlerProvider> {
    return this.getOrCreate('XyoTakeOriginChainBoundWitnessHandlerProvider', async () => {
      const originStateRepository = await this.getOriginStateRepository()
      const boundWitnessPayloadProvider = await this.getBoundWitnessPayloadProvider()
      const boundWitnessSuccessListener = await this.getBoundWitnessSuccessListener()
      const serializationService = await this.getSerializationService()

      const takeOriginChainServerInteractionFactory: IXyoBoundWitnessInteractionFactory = {
        newInstance: (signers, payload) =>  {
          return new XyoBoundWitnessTakeOriginChainServerInteraction(
            signers,
            payload,
            serializationService
          )
        }
      }

      return new XyoBoundWitnessHandlerProvider(
        originStateRepository,
        boundWitnessPayloadProvider,
        boundWitnessSuccessListener,
        takeOriginChainServerInteractionFactory
      )
    })
  }

  protected async getHashingProvider(): Promise<IXyoHashProvider> {
    return this.getOrCreate('IXyoHashProvider', async () => {
      return getHashingProvider('sha256')
    })
  }

  protected async getOriginStateRepository(): Promise<IXyoOriginChainRepository> {
    return this.getOrCreate('IXyoOriginChainRepository', async () => {

      // All these values are uninteresting given that we are bootstrapping the chain every time and not
      // persisting outside outside of a process life-cycle. SubClasses should consider overriding this method

      const signers = await this.getSigners()
      const originBlockRepo = await this.getOriginBlockRepository()
      const serializationService = await this.getSerializationService()

      return new XyoOriginChainStateInMemoryRepository(
        0, // index
        [], // hashes
        [], // public keys
        originBlockRepo,
        signers,
        undefined, // next-public-key
        [], // waiting signers
        serializationService,
        undefined // genesis signer
      )
    })
  }

  protected async getSigners(): Promise<IXyoSigner[]> {
    return this.getOrCreate('IXyoSigners', async () => {
      return [getSignerProvider('secp256k1-sha256').newInstance()]
    })
  }

  protected async getOriginBlockRepository(): Promise<IXyoOriginBlockRepository> {
    return this.getOrCreate('IXyoOriginBlockRepository', async () => {
      const storageProvider = new XyoInMemoryStorageProvider()
      const serializationService = await this.getSerializationService()
      const hashProvider = await this.getHashingProvider()
      return new XyoOriginBlockRepository(storageProvider, serializationService, hashProvider)
    })
  }

  protected async getBoundWitnessPayloadProvider(): Promise<IXyoBoundWitnessPayloadProvider> {
    return new XyoBoundWitnessPayloadProvider()
  }

  protected async getBoundWitnessSuccessListener(): Promise<IXyoBoundWitnessSuccessListener> {
    return this.getOrCreate('IXyoBoundWitnessSuccessListener', async () => {
      const hashingProvider = await this.getHashingProvider()
      const originBlockRepository = await this.getOriginBlockRepository()
      const boundWitnessValidator = await this.getBoundWitnessValidator()
      const originChainRepository = await this.getOriginStateRepository()

      return new XyoBoundWitnessSuccessListener(
        hashingProvider,
        boundWitnessValidator,
        originChainRepository,
        originBlockRepository
      )
    })
  }

  protected async getBoundWitnessValidator(): Promise<XyoBoundWitnessValidator> {
    return this.getOrCreate('XyoBoundWitnessValidator', async () => {
      const validatorSettings = await this.getBoundWitnessValidatorSettings()
      return new XyoBoundWitnessValidator(validatorSettings)
    })
  }

  protected async getBoundWitnessValidatorSettings() {
    return {
      checkPartyLengths: true,
      checkIndexExists: true,
      checkCountOfSignaturesMatchPublicKeysCount: true,
      validateSignatures: true,
      validateHash: true
    }
  }

  protected async getNestedBoundWitnessExtractor(): Promise<XyoNestedBoundWitnessExtractor> {
    return this.getOrCreate('XyoNestedBoundWitnessExtractor', async () => {
      return new XyoNestedBoundWitnessExtractor()
    })
  }

  protected async getSerializationService(): Promise<IXyoSerializationService>  {
    return this.getOrCreate('IXyoSerializationService', async () => {
      return serializer
    })
  }

  private async configureOriginChainStateRepository() {
    const originChainStateRepository = await this.getOriginStateRepository()
    const originChainSigners = await originChainStateRepository.getSigners()

    if (originChainSigners.length === 0) {
      const signers = await this.getSigners()
      await originChainStateRepository.setCurrentSigners(signers)
    }

    const currentIndex = await originChainStateRepository.getIndex()

    if (currentIndex === 0) { // create genesis block
      const genesisBlock = await originChainStateRepository.createGenesisBlock()
      const hashingProvider = await this.getHashingProvider()
      const hash = await hashingProvider.createHash(genesisBlock.getSigningData())
      const originBlockRepository = await this.getOriginBlockRepository()
      await originBlockRepository.addOriginBlock(hash, genesisBlock)
      originChainStateRepository.updateOriginChainState(hash, genesisBlock)
      this.logInfo(`Add genesis block with hash ${hash.serializeHex()}`)
    }
  }
}

if (require.main === module) {
  const testNode = new XyoBaseNode()
  testNode.start()
}
