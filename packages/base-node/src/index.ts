/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 11:39:13 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 16th January 2019 5:14:33 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import { XyoNodeRunner } from '@xyo-network/node-runner'
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
import { IXyoSigner } from '@xyo-network/signing'
import { serializer } from '@xyo-network/serializer'

// tslint:disable-next-line:max-classes-per-file
export class XyoBaseNode extends XyoBase {

  protected nodeRunner: XyoNodeRunner | undefined

  public async start(): Promise<void> {
    await this.configureOriginChainStateRepository()
    const delegate = await this.getPeerConnectionDelegate()
    this.nodeRunner = new XyoNodeRunner(delegate)
    this.nodeRunner.start()
  }

  public async stop(): Promise<boolean> {
    if (this.nodeRunner) {
      await this.nodeRunner.stop()
      return true
    }

    return false
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
      return new XyoOriginChainStateInMemoryRepository(0, undefined, signers, undefined, [], undefined)
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
      originChainStateRepository.updateOriginChainState(hash)
      this.logInfo(`Add genesis block with hash ${hash.serializeHex()}`)
    }
  }
}

if (require.main === module) {
  const testNode = new XyoBaseNode()
  testNode.start()
}
