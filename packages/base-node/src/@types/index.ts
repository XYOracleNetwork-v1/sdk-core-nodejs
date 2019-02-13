import { IResolvers } from "../xyo-resolvers-enum"
import { IXyoSigner, IXyoPublicKey } from "@xyo-network/signing"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoHashProvider, IXyoHash } from "@xyo-network/hashing"
import { IXyoOriginChainRepository } from "@xyo-network/origin-chain"
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"
import { IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessSuccessListener } from "@xyo-network/peer-interaction"
import { XyoBoundWitnessValidator, IXyoBoundWitnessValidationOptions } from "@xyo-network/bound-witness"
import { CatalogueItem, IXyoNetworkProcedureCatalogue, IXyoNetworkProvider } from "@xyo-network/network"
import { IXyoPeerConnectionDelegate } from "@xyo-network/peer-connections"
import { IXyoNodeRunnerDelegate } from "@xyo-network/node-runner"
import { IXyoNodeNetwork, IXyoComponentFeatureResponse } from "@xyo-network/node-network"
import { IXyoP2PService, IXyoPeerDiscoveryService, IXyoPeerTransport } from "@xyo-network/p2p"
import { IXyoRepository } from "@xyo-network/utils"
import { IXyoTransaction } from "@xyo-network/transaction-pool"

// tslint:disable:max-line-length

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 12:54:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th February 2019 1:33:28 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export type depScope = 'transient' | 'singleton'
export interface IXyoProviderContainer {
  hasDependency(dep: IResolvers): boolean
  get<T>(dep: IResolvers): Promise<T>
  register<T, C, I>(dep: IResolvers, provider: IXyoProvider<T, C, I>, scope: depScope): void
}

export interface IXyoProvider<T, C, I> {
  get(container: IXyoProviderContainer, context?: C): Promise<T>,
  initialize?(instance: T, container: IXyoProviderContainer, initParams: I): Promise<void>
}

export interface IXyoResolvers {
  [IResolvers.PEER_TRANSPORT]: IXyoProvider<IXyoPeerTransport, undefined, IXyoPeerTransportConfig>
  [IResolvers.SIGNERS]: IXyoProvider<IXyoSigner[], undefined, undefined>
  [IResolvers.SERIALIZATION_SERVICE]: IXyoProvider<IXyoSerializationService, undefined, undefined>
  [IResolvers.HASH_PROVIDER]: IXyoProvider<IXyoHashProvider, undefined, undefined>
  [IResolvers.ORIGIN_CHAIN_REPOSITORY]: IXyoProvider<IXyoOriginChainRepository, undefined, undefined>
  [IResolvers.ORIGIN_BLOCK_REPOSITORY]: IXyoProvider<IXyoOriginBlockRepository, undefined, undefined>
  [IResolvers.BOUND_WITNESS_PAYLOAD_PROVIDER]: IXyoProvider<IXyoBoundWitnessPayloadProvider, undefined, undefined>
  [IResolvers.BOUND_WITNESS_SUCCESS_LISTENER]: IXyoProvider<IXyoBoundWitnessSuccessListener, undefined, undefined>
  [IResolvers.BOUND_WITNESS_VALIDATOR]: IXyoProvider<XyoBoundWitnessValidator, undefined, IXyoBoundWitnessValidationOptions>
  [IResolvers.NETWORK_PROCEDURE_CATALOGUE]: IXyoProvider<IXyoNetworkProcedureCatalogue, undefined, IXyoNetworkProcedureCatalogueConfig>
  [IResolvers.NETWORK]: IXyoProvider<IXyoNetworkProvider, undefined, IXyoNetworkConfig>
  [IResolvers.PEER_CONNECTION_DELEGATE]: IXyoProvider<IXyoPeerConnectionDelegate, undefined, undefined>
  [IResolvers.NODE_RUNNER_DELEGATE]: IXyoProvider<IXyoNodeRunnerDelegate, undefined, undefined>
  [IResolvers.NODE_NETWORK]: IXyoProvider<IXyoNodeNetwork, undefined, IXyoNodeNetworkConfig>
  [IResolvers.P2P_SERVICE]: IXyoProvider<IXyoP2PService, undefined, undefined>
  [IResolvers.DISCOVERY_NETWORK]: IXyoProvider<IXyoPeerDiscoveryService, undefined, IXyoDiscoveryConfig>
  [IResolvers.TRANSACTION_REPOSITORY]: IXyoRepository<IXyoHash, IXyoTransaction<any>>
}

export interface IXyoDiscoveryConfig {
  bootstrapNodes: string[]
  publicKey: string
  address: string
}

export interface IXyoPeerTransportConfig {
  address: string
}

export interface IXyoNodeNetworkConfig {
  shouldServiceBlockPermissionRequests: boolean
  features: IXyoComponentFeatureResponse
}

export interface IXyoNetworkConfig {
  port: number
}

export interface IXyoNetworkProcedureCatalogueConfig {
  catalogue: CatalogueItem[]
}
