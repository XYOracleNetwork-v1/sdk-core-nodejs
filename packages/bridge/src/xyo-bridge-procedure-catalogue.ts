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
import { XyoBridgeBoundWitnessSuccessListener } from './xyo-bridge-bound-witness-success-listener'
import { XyoNodeRunner, IXyoNodeRunnerDelegate } from '@xyo-network/node-runner'
import { XyoPeerInteractionRouter } from '@xyo-network/peer-interaction-router'
import { XyoClientTcpNetwork, IXyoNetworkAddressProvider, IXyoTCPNetworkAddress } from '@xyo-network/network.tcp'
import { IXyoPeerConnectionDelegate, XyoSimplePeerConnectionDelegate, XyoPeerConnectionHandler, IXyoCatalogueResolver } from '@xyo-network/peer-connections'

export class XyoBrideProcedureCatalogue implements IXyoNetworkProcedureCatalogue {

  constructor(private advertising: CatalogueItem[]) {

  }

  public canDo (catalogueItem: CatalogueItem): boolean {
    if (catalogueItem === CatalogueItem.GIVE_ORIGIN_CHAIN) {
      return true
    }

    if (catalogueItem === CatalogueItem.TAKE_ORIGIN_CHAIN) {
      return true
    }

    if (catalogueItem === CatalogueItem.BOUND_WITNESS) {
      return true
    }

    return false
  }

  public getCurrentCatalogue (): CatalogueItem[] {
    return this.advertising
  }

  public setCatalogue (catalogue: CatalogueItem[]): void {
    throw Error("Bridge catalogue setting not supported")
  }
}
