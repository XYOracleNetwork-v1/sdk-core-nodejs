/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 3:47:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 11th February 2019 10:17:40 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { providers } from './providers'
import { IXyoProvider } from "./@types"
import { IXyoSigner, IXyoPublicKey } from "@xyo-network/signing"
import { CatalogueItem, IXyoNetworkProcedureCatalogue, IXyoNetworkProvider } from "@xyo-network/network"
import { IXyoPeerConnectionDelegate } from "@xyo-network/peer-connections"
import { IXyoNodeRunnerDelegate } from "@xyo-network/node-runner"
import { IXyoNodeNetwork } from "@xyo-network/node-network"
import { IXyoP2PService, IXyoPeerDiscoveryService } from "@xyo-network/p2p"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoHashProvider } from "@xyo-network/hashing"
import { IXyoOriginChainRepository } from "@xyo-network/origin-chain"
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"
import { IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessSuccessListener } from "@xyo-network/peer-interaction"
import { XyoBoundWitnessValidator, IXyoBoundWitnessValidationOptions } from "@xyo-network/bound-witness"

export class XyoNode extends XyoBase {

  constructor() {
    super()
  }
}

export interface IXyoNodeProviders {
  signersProvider: IXyoProvider<IXyoSigner[]>
  boundWitnessCatalogueProvider: IXyoProvider<CatalogueItem[]>
  boundWitnessServerPortProvider: IXyoProvider<number>
  networkProvider: IXyoProvider<IXyoNetworkProvider>
  peerConnectionDelegateProvider: IXyoProvider<IXyoPeerConnectionDelegate>
  nodeRunnerDelegateProvider: IXyoProvider<IXyoNodeRunnerDelegate>
  nodeNetworkProvider: IXyoProvider<IXyoNodeNetwork>
  p2PServiceProvider: IXyoProvider<IXyoP2PService>
  discoveryNetworkProvider: IXyoProvider<IXyoPeerDiscoveryService>
  discoveryNetworkPublicKeyProvider: IXyoProvider<IXyoPublicKey>
  p2pAddressProvider: IXyoProvider<string>
  serializationServiceProvider: IXyoProvider<IXyoSerializationService>
  hashProvider: IXyoProvider<IXyoHashProvider>
  originChainRepositoryProvider: IXyoProvider<IXyoOriginChainRepository>
  originBlockRepositoryProvider: IXyoProvider<IXyoOriginBlockRepository>
  boundWitnessPayloadProviderProvider: IXyoProvider<IXyoBoundWitnessPayloadProvider>
  boundWitnessSuccessListenerProvider: IXyoProvider<IXyoBoundWitnessSuccessListener>
  boundWitnessValidatorProvider: IXyoProvider<XyoBoundWitnessValidator>
  boundWitnessValidationOptionsProvider: IXyoProvider<IXyoBoundWitnessValidationOptions>
}

export interface IXyoTCPBoundWitnessConfig {
  serverPort: number,
}

export interface IXyoBoundWitnessConfig {
  catalogue: CatalogueItem[],
  tcp: IXyoNodeProviders
}

export interface IXyoNodeConfig {
  boundWitness: IXyoBoundWitnessConfig
}

export interface IXyoNodeOptions {
  modules: {}
  config: IXyoNodeConfig
}
