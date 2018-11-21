/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 11:39:13 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 21st November 2018 2:17:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import { XyoNode } from '@xyo-network/node'
import { IXyoNetworkProvider, IXyoNetworkProcedureCatalogue, CatalogueItem } from '@xyo-network/network'
import { XyoServerTcpNetwork } from '@xyo-network/network.tcp'
import { XyoSimplePeerConnectionDelegate, IXyoPeerConnectionDelegate, IXyoPeerConnectionHandler, XyoPeerConnectionHandler } from '@xyo-network/peer-connections'
import { XyoPeerInteractionRouter } from '@xyo-network/peer-interaction-router'
import { XyoBoundWitnessStandardServerInteraction, XyoBoundWitnessTakeOriginChainServerInteraction } from '@xyo-network/peer-interaction-handlers'
import { IXyoHashProvider, getHashingProvider } from '@xyo-network/hashing'
import {
  XyoBoundWitnessHandlerProvider,
  IXyoBoundWitnessPayloadProvider,
  IXyoBoundWitnessSuccessListener,
  XyoNestedBoundWitnessExtractor,
  XyoBoundWitnessPayloadProvider
} from '@xyo-network/peer-interaction'
import { IXyoOriginChainRepository, XyoOriginChainStateInMemoryRepository } from '@xyo-network/origin-chain'
import { IXyoOriginBlockRepository, XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { XyoBoundWitnessValidator, IXyoBoundWitnessSigningDataProducer, XyoBoundWitnessSigningService, IXyoBoundWitness, IXyoPayload } from '@xyo-network/bound-witness'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { XyoInMemoryStorageProvider } from '@xyo-network/storage'

export class XyoTestNode extends XyoBase {

  public start() {
    const node = new XyoNode(this.getPeerConnectionDelegate())
    node.start()
  }

  private getPeerConnectionDelegate(): IXyoPeerConnectionDelegate {
    return new XyoSimplePeerConnectionDelegate(
      this.getNetwork(),
      this.getCatalogue(),
      this.getPeerConnectionHandler()
    )
  }

  private getNetwork(): IXyoNetworkProvider {
    const server = new XyoServerTcpNetwork(11000)
    return server
  }

  private getCatalogue(): IXyoNetworkProcedureCatalogue {
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
  }

  private getPeerConnectionHandler(): IXyoPeerConnectionHandler {
    return new XyoPeerConnectionHandler(
      this.getPeerInteractionRouter(),
      this.getPeerInteractionRouter()
    )
  }

  private getPeerInteractionRouter(): XyoPeerInteractionRouter {
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
  }

  private getStandardBoundWitnessHandlerProvider(): XyoBoundWitnessHandlerProvider {
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
            this.getBoundWitnessSigningService(),
            this.getSerializationService()
          )
        }
      },
      this.getBoundWitnessValidator(),
      this.getBoundWitnessSigningDataProducer(),
      this.getNestedBoundWitnessExtractor(),
      this.getSerializationService()
    )
  }

  private getTakeOriginChainBoundWitnessHandlerProvider(): XyoBoundWitnessHandlerProvider {
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
            this.getBoundWitnessSigningService(),
            this.getSerializationService()
          )
        }
      },
      this.getBoundWitnessValidator(),
      this.getBoundWitnessSigningDataProducer(),
      this.getNestedBoundWitnessExtractor(),
      this.getSerializationService()
    )
  }

  private getBoundWitnessSigningService(): XyoBoundWitnessSigningService {
    return new XyoBoundWitnessSigningService(
      this.getBoundWitnessSigningDataProducer()
    )
  }

  private getHashingProvider(): IXyoHashProvider {
    return getHashingProvider('sha256')
  }

  private getOriginStateRepository(): IXyoOriginChainRepository {
    return new XyoOriginChainStateInMemoryRepository(
      0,
      undefined,
      [],
      undefined,
      [],
      undefined
    )
  }

  private getOriginBlockRepository(): IXyoOriginBlockRepository {
    return new XyoOriginBlockRepository(
      new XyoInMemoryStorageProvider(),
      this.getSerializationService()
    )
  }

  private getBoundWitnessPayloadProvider(): IXyoBoundWitnessPayloadProvider {
    return new XyoBoundWitnessPayloadProvider()
  }

  private getBoundWitnessSuccessListener(): IXyoBoundWitnessSuccessListener {
    return {
      onBoundWitnessSuccess: async (boundWitness: IXyoBoundWitness) => {
        this.logInfo(`BoundWitness Success 😁`)
      }
    }
  }

  private getBoundWitnessValidator(): XyoBoundWitnessValidator {
    return new XyoBoundWitnessValidator(
      this.getBoundWitnessSigningDataProducer(),
      this.getExtractIndexFromPayloadFn(),
      {
        checkPartyLengths: true,
        checkIndexExists: true,
        checkCountOfSignaturesMatchPublicKeysCount: true,
        validateSignatures: true,
        validateHash: true
      }
    )
  }

  private getExtractIndexFromPayloadFn(): (payload: IXyoPayload) => number | undefined {
    throw new Error(`Not yet implemented`)
  }

  private getBoundWitnessSigningDataProducer(): IXyoBoundWitnessSigningDataProducer {
    throw new Error(`Not implemented yet`)
  }

  private getNestedBoundWitnessExtractor(): XyoNestedBoundWitnessExtractor {
    throw new Error(`Not implemented yet`)
  }

  private getSerializationService(): IXyoSerializationService  {
    throw new Error(`Not implemented yet`)
  }
}

if (require.main === module) {
  const testNode = new XyoTestNode()
  testNode.start()
}
