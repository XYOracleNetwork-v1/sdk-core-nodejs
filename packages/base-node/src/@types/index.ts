import { IResolvers } from "../xyo-resolvers-enum"
import { IXyoSigner } from "@xyo-network/signing"
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
 * @Last modified time: Wednesday, 13th February 2019 3:52:42 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export type depScope = 'transient' | 'singleton'
export interface IXyoProviderContainer {
  hasDependency(dep: IResolvers): boolean
  get<T>(dep: IResolvers): Promise<T>
  register<T, C>(dep: IResolvers, provider: IXyoProvider<T, C>, scope: depScope): void
}

export interface IXyoProvider<T, C> {
  get(container: IXyoProviderContainer, context: C): Promise<T>
  postInit?(instance: T, container: IXyoProviderContainer, context: C): Promise<void>
}

export interface IXyoResolvers {
  [IResolvers.PEER_TRANSPORT]: IXyoProvider<IXyoPeerTransport, IXyoPeerTransportConfig>
  [IResolvers.SIGNERS]: IXyoProvider<IXyoSigner[], undefined>
  [IResolvers.SERIALIZATION_SERVICE]: IXyoProvider<IXyoSerializationService, undefined>
  [IResolvers.HASH_PROVIDER]: IXyoProvider<IXyoHashProvider, undefined>
  [IResolvers.ORIGIN_CHAIN_REPOSITORY]: IXyoProvider<IXyoOriginChainRepository, IXyoOriginChainConfig>
  [IResolvers.ORIGIN_BLOCK_REPOSITORY]: IXyoProvider<IXyoOriginBlockRepository, undefined>
  [IResolvers.BOUND_WITNESS_PAYLOAD_PROVIDER]: IXyoProvider<IXyoBoundWitnessPayloadProvider, undefined>
  [IResolvers.BOUND_WITNESS_SUCCESS_LISTENER]: IXyoProvider<IXyoBoundWitnessSuccessListener, undefined>
  [IResolvers.BOUND_WITNESS_VALIDATOR]: IXyoProvider<XyoBoundWitnessValidator, IXyoBoundWitnessValidationOptions>
  [IResolvers.NETWORK_PROCEDURE_CATALOGUE]: IXyoProvider<IXyoNetworkProcedureCatalogue, IXyoNetworkProcedureCatalogueConfig>
  [IResolvers.NETWORK]: IXyoProvider<IXyoNetworkProvider, IXyoNetworkConfig>
  [IResolvers.PEER_CONNECTION_DELEGATE]: IXyoProvider<IXyoPeerConnectionDelegate, undefined>
  [IResolvers.NODE_RUNNER_DELEGATE]: IXyoProvider<IXyoNodeRunnerDelegate, undefined>
  [IResolvers.NODE_NETWORK]: IXyoProvider<IXyoNodeNetwork, IXyoNodeNetworkConfig>
  [IResolvers.P2P_SERVICE]: IXyoProvider<IXyoP2PService, undefined>
  [IResolvers.DISCOVERY_NETWORK]: IXyoProvider<IXyoPeerDiscoveryService, IXyoDiscoveryConfig>
  [IResolvers.TRANSACTION_REPOSITORY]: IXyoProvider<IXyoRepository<IXyoHash, IXyoTransaction<any>>, undefined>
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

export interface IXyoOriginChainConfig {
  data: string
}
