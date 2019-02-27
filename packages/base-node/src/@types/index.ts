/*
* @Author: XY | The Findables Company <ryanxyo>
* @Date:   Friday, 8th February 2019 12:54:30 pm
* @Email:  developer@xyfindables.com
* @Filename: index.ts
* @Last modified by: ryanxyo
* @Last modified time: Thursday, 14th February 2019 10:33:42 am
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/

// tslint:disable:max-line-length
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
import { IXyoRepository, IXyoProvider } from "@xyo-network/utils"
import { IXyoTransaction } from "@xyo-network/transaction-pool"
import { XyoAboutMeService } from "@xyo-network/about-me"
import { IContractData } from "@xyo-network/web3-service"

export interface IXyoResolvers {
  [key: string]: IXyoProvider<any, any>
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
  [IResolvers.NODE_RUNNER_DELEGATES]: IXyoProvider<IXyoNodeRunnerDelegate[], undefined>
  [IResolvers.NODE_NETWORK]: IXyoProvider<IXyoNodeNetwork, IXyoNodeNetworkConfig>
  [IResolvers.P2P_SERVICE]: IXyoProvider<IXyoP2PService, undefined>
  [IResolvers.DISCOVERY_NETWORK]: IXyoProvider<IXyoPeerDiscoveryService, IXyoDiscoveryConfig>
  [IResolvers.TRANSACTION_REPOSITORY]: IXyoProvider<IXyoRepository<IXyoHash, IXyoTransaction<any>>, undefined>
  [IResolvers.ABOUT_ME_SERVICE]: IXyoProvider<XyoAboutMeService, IXyoAboutMeConfig>
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

export interface IXyoAboutMeConfig {
  ip: string,
  boundWitnessServerPort: number | undefined,
  graphqlPort: number | undefined,
  version: string,
  name: string
}

export interface IXyoGraphQLConfig {
  port: number,
  apis: {
    about: boolean,
    blockByHash: boolean,
    blockList: boolean,
    entities: boolean,
    blocksByPublicKey: boolean,
    intersections: boolean,
    transactionList: boolean
  }
}

export interface IXyoWeb3ServiceConfig {
  host: string,
  account: string,
  contracts: {
    PayOnDelivery: IContractData,
    XyStakingConsensus: IContractData,
    XyStakableToken: IContractData,
  }
}

export interface IXyoTCPBoundWitnessConfig {
  serverPort: number,
}

export interface IXyoBoundWitnessConfig {
  catalogue: CatalogueItem[],
  tcp: IXyoTCPBoundWitnessConfig
}

export interface IXyoDataConfig {
  path: string
}

export interface IXyoNodeDelegatesConfig {
  enableBoundWitnessServer: boolean
  enableGraphQLServer: boolean
  enableQuestionsWorker: boolean
}

export interface IXyoNodeConfig {
  [key: string]: any
  data: IXyoDataConfig
}

export interface IXyoNodeOptions {
  modules: Partial<IXyoResolvers>
  config: IXyoNodeConfig
}

export type PartialNodeOptions = Partial<IXyoNodeOptions>
