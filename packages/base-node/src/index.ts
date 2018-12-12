/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 11:39:13 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 4:25:32 pm
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

import { createSerializer } from './xyo-serialization-config'
import {
  XyoBoundWitnessHandlerProvider,
  IXyoBoundWitnessPayloadProvider,
  IXyoBoundWitnessSuccessListener,
  XyoNestedBoundWitnessExtractor,
  XyoBoundWitnessPayloadProvider
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

// tslint:disable-next-line:max-classes-per-file
export class XyoBaseNode extends XyoBase {

  public start() {
    const nodeRunner = new XyoNodeRunner(this.getPeerConnectionDelegate())
    nodeRunner.start()
  }

  protected getPeerConnectionDelegate(): IXyoPeerConnectionDelegate {
    return this.getOrCreate('IXyoPeerConnectionDelegate', () => {
      return new XyoSimplePeerConnectionDelegate(
        this.getNetwork(),
        this.getCatalogue(),
        this.getPeerConnectionHandler()
      )
    })
  }

  protected getNetwork(): IXyoNetworkProvider {
    return this.getOrCreate('IXyoNetworkProvider', () => {
      return new XyoServerTcpNetwork(11000)
    })
  }

  protected getCatalogue(): IXyoNetworkProcedureCatalogue {
    return this.getOrCreate('IXyoNetworkProcedureCatalogue', () => {
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

  protected getPeerConnectionHandler(): IXyoPeerConnectionHandler {
    return this.getOrCreate('IXyoPeerConnectionHandler', () => {
      return new XyoPeerConnectionHandler(
        this.getPeerInteractionRouter(),
        this.getPeerInteractionRouter()
      )
    })
  }

  protected getPeerInteractionRouter(): XyoPeerInteractionRouter {
    return this.getOrCreate('XyoPeerInteractionRouter', () => {
      const peerInteractionRouter = new XyoPeerInteractionRouter()

      // Routes
      peerInteractionRouter.use(
        CatalogueItem.BOUND_WITNESS,
        () => {
          return this.getStandardBoundWitnessHandlerProvider()
        }
      )

      peerInteractionRouter.use(
        CatalogueItem.TAKE_ORIGIN_CHAIN,
        () => {
          return this.getTakeOriginChainBoundWitnessHandlerProvider()
        }
      )
      return peerInteractionRouter
    })
  }

  protected getStandardBoundWitnessHandlerProvider(): XyoBoundWitnessHandlerProvider {
    return this.getOrCreate('XyoStandardBoundWitnessHandlerProvider', () => {
      return new XyoBoundWitnessHandlerProvider(
        this.getHashingProvider(),
        this.getOriginStateRepository(),
        this.getOriginBlockRepository(),
        this.getBoundWitnessPayloadProvider(),
        this.getBoundWitnessSuccessListener(),
        {
          newInstance: (signers, payload) =>  {
            return new XyoBoundWitnessStandardServerInteraction(
              signers,
              payload,
              this.getSerializationService()
            )
          }
        },
        this.getBoundWitnessValidator(),
        this.getNestedBoundWitnessExtractor()
      )
    })
  }

  protected getTakeOriginChainBoundWitnessHandlerProvider(): XyoBoundWitnessHandlerProvider {
    return this.getOrCreate('XyoTakeOriginChainBoundWitnessHandlerProvider', () => {
      return new XyoBoundWitnessHandlerProvider(
        this.getHashingProvider(),
        this.getOriginStateRepository(),
        this.getOriginBlockRepository(),
        this.getBoundWitnessPayloadProvider(),
        this.getBoundWitnessSuccessListener(),
        {
          newInstance: (signers, payload) =>  {
            return new XyoBoundWitnessTakeOriginChainServerInteraction(
              signers,
              payload,
              this.getSerializationService()
            )
          }
        },
        this.getBoundWitnessValidator(),
        this.getNestedBoundWitnessExtractor()
      )
    })
  }

  protected getHashingProvider(): IXyoHashProvider {
    return this.getOrCreate('IXyoHashProvider', () => {
      return getHashingProvider('sha256')
    })
  }

  protected getOriginStateRepository(): IXyoOriginChainRepository {
    return this.getOrCreate('IXyoOriginChainRepository', () => {
      return new XyoOriginChainStateInMemoryRepository(
        0,
        undefined,
        this.getSigners(),
        undefined,
        [],
        undefined
      )
    })
  }

  protected getSigners(): IXyoSigner[] {
    return this.getOrCreate('IXyoSigners', () => {
      return [getSignerProvider('secp256k1-sha256').newInstance()]
    })
  }
  protected getOriginBlockRepository(): IXyoOriginBlockRepository {
    return this.getOrCreate('IXyoOriginBlockRepository', () => {
      return new XyoOriginBlockRepository(new XyoInMemoryStorageProvider(), this.getSerializationService())
    })
  }

  protected getBoundWitnessPayloadProvider(): IXyoBoundWitnessPayloadProvider {
    return new XyoBoundWitnessPayloadProvider()
  }

  protected getBoundWitnessSuccessListener(): IXyoBoundWitnessSuccessListener {
    return this.getOrCreate('IXyoBoundWitnessSuccessListener', () => {
      return {
        onBoundWitnessSuccess: async (boundWitness: IXyoBoundWitness) => {
          this.logInfo(`BoundWitness Success 😁`)
        }
      }
    })
  }

  protected getBoundWitnessValidator(): XyoBoundWitnessValidator {
    return this.getOrCreate('XyoBoundWitnessValidator', () => {
      return new XyoBoundWitnessValidator(
        {
          checkPartyLengths: true,
          checkIndexExists: true,
          checkCountOfSignaturesMatchPublicKeysCount: true,
          validateSignatures: true,
          validateHash: true
        }
      )
    })
  }

  protected getNestedBoundWitnessExtractor(): XyoNestedBoundWitnessExtractor {
    return this.getOrCreate('XyoNestedBoundWitnessExtractor', () => {
      return new XyoNestedBoundWitnessExtractor(() => false) // TODO
    })
  }

  protected getSerializationService(): IXyoSerializationService  {
    return this.getOrCreate('IXyoSerializationService', () => {
      return createSerializer()
    })
  }
}

if (require.main === module) {
  const testNode = new XyoBaseNode()
  testNode.start()
}
