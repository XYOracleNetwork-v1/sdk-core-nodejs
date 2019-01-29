/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 11:39:13 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 29th January 2019 2:56:42 pm
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
import { IXyoHashProvider, getHashingProvider } from '@xyo-network/hashing'
import { getSignerProvider } from '@xyo-network/signing.ecdsa'

import {
  XyoBoundWitnessHandlerProvider,
  IXyoBoundWitnessPayloadProvider,
  IXyoBoundWitnessSuccessListener,
  XyoNestedBoundWitnessExtractor,
  XyoBoundWitnessPayloadProvider,
  IXyoBoundWitnessInteractionFactory
} from '@xyo-network/peer-interaction'

import {
  IXyoOriginChainRepository,
  XyoOriginChainStateInMemoryRepository
} from '@xyo-network/origin-chain'

import { IXyoOriginBlockRepository, XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import {
  XyoBoundWitnessValidator,
  IXyoBoundWitness
} from '@xyo-network/bound-witness'

import { IXyoSerializationService } from '@xyo-network/serialization'
import { XyoInMemoryStorageProvider } from '@xyo-network/storage'
import { IXyoSigner, IXyoPublicKey } from '@xyo-network/signing'
import { serializer } from '@xyo-network/serializer'
import { IXyoNodeNetwork, XyoNodeNetwork, IXyoComponentFeatureResponse } from '@xyo-network/node-network'
import { IXyoP2PService, XyoP2PService, IXyoPeerDiscoveryService, XyoPeerDiscoveryService, XyoPeerTransport } from '@xyo-network/p2p'
import { XyoError, XyoErrors } from '@xyo-network/errors'

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
      const network = new XyoNodeNetwork(p2pService)
      const features = await this.getNodeFeatures()
      network.setFeatures(features)
      return network
    })
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
    return this.getOrCreate(`IXyoNodeNetwork`, async () => {
      const discoveryPublicKey = await this.getDiscoveryNetworkPublicKey()
      const p2pAddress = await this.getP2PAddress()
      const peerTransport = new XyoPeerTransport(p2pAddress)
      const bootstrapNodes = await this.getDiscoveryBootstrapNodes()
      const discoveryService = new XyoPeerDiscoveryService(discoveryPublicKey.serializeHex(), p2pAddress, peerTransport)
      discoveryService.addBootstrapNodes(bootstrapNodes)
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
      const hashingProvider = await this.getHashingProvider()
      const originStateRepository = await this.getOriginStateRepository()
      const originBlockRepository = await this.getOriginBlockRepository()
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
      const boundWitnessValidator = await this.getBoundWitnessValidator()
      const nestedBoundWitnessExtractor = await this.getNestedBoundWitnessExtractor()

      return new XyoBoundWitnessHandlerProvider(
        hashingProvider,
        originStateRepository,
        originBlockRepository,
        boundWitnessPayloadProvider,
        boundWitnessSuccessListener,
        standardServerInteractionFactory,
        boundWitnessValidator,
        nestedBoundWitnessExtractor
      )
    })
  }

  protected async getTakeOriginChainBoundWitnessHandlerProvider(): Promise<XyoBoundWitnessHandlerProvider> {
    return this.getOrCreate('XyoTakeOriginChainBoundWitnessHandlerProvider', async () => {
      const hashingProvider = await this.getHashingProvider()
      const originStateRepository = await this.getOriginStateRepository()
      const originBlockRepository = await this.getOriginBlockRepository()
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

      const boundWitnessValidator = await this.getBoundWitnessValidator()
      const nestedBoundWitnessExtractor = await this.getNestedBoundWitnessExtractor()

      return new XyoBoundWitnessHandlerProvider(
        hashingProvider,
        originStateRepository,
        originBlockRepository,
        boundWitnessPayloadProvider,
        boundWitnessSuccessListener,
        takeOriginChainServerInteractionFactory,
        boundWitnessValidator,
        nestedBoundWitnessExtractor
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
      return new XyoOriginBlockRepository(storageProvider, serializationService)
    })
  }

  protected async getBoundWitnessPayloadProvider(): Promise<IXyoBoundWitnessPayloadProvider> {
    return new XyoBoundWitnessPayloadProvider()
  }

  protected async getBoundWitnessSuccessListener(): Promise<IXyoBoundWitnessSuccessListener> {
    return this.getOrCreate('IXyoBoundWitnessSuccessListener', async () => {
      const hashingProvider = await this.getHashingProvider()
      return {
        onBoundWitnessSuccess: async (boundWitness: IXyoBoundWitness) => {
          const hash = await hashingProvider.createHash(boundWitness.getSigningData())
          this.logInfo(`Created bound witness with hash ${hash}`)
        }
      }
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
