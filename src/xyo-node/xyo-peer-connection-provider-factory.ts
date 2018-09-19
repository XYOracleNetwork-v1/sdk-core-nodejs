/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 10:03:52 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-connection-provider-builder.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 11:00:05 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPeerConnectionDelegate, xyoPeerConnectionHandler, XyoPeerConnectionHandler } from './xyo-node-types';
import { XyoPeerConnectionDelegateImpl } from './xyo-peer-connection-provider-impl';
import { XyoNetworkProcedureCatalogue, XyoNetworkProviderInterface } from '../network/xyo-network';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoSigner } from '../signing/xyo-signer';
import { XyoHashProvider } from '../hash-provider/xyo-hash-provider';
import { XyoOriginChainStateManager } from './origin-chain/xyo-origin-chain-state-manager';
import { XyoOriginChainNavigator } from './origin-chain/xyo-origin-chain-navigator';
import { XyoBoundWitnessPayloadProviderImpl } from './xyo-bound-witness-payload-provider-impl';
import { XyoBoundWitnessHandlerProviderImpl } from './xyo-bound-witness-handler-provider-impl';
import { XyoPeerConnectionHandlerImpl } from './xyo-peer-connection-handler-impl';

export class XyoPeerConnectionProviderFactory {

  constructor(
    private readonly network: XyoNetworkProviderInterface,
    private readonly catalogue: XyoNetworkProcedureCatalogue,
    private readonly xyoPacker: XyoPacker,
    private readonly signers: XyoSigner[],
    private readonly hashingProvider: XyoHashProvider,
    private readonly originChainStateManager: XyoOriginChainStateManager,
    private readonly originChainNavigator: XyoOriginChainNavigator,
    private readonly boundWitnessPayloadProvider: XyoBoundWitnessPayloadProviderImpl
  ) {}

  public newInstance(): XyoPeerConnectionDelegate {
    return new XyoPeerConnectionDelegateImpl(
      this.network,
      this.catalogue,
      this.getPeerConnectionHandler()
    );
  }

  private getPeerConnectionHandler(): XyoPeerConnectionHandler {
    const boundWitnessHandlerProvider = new XyoBoundWitnessHandlerProviderImpl(
      this.xyoPacker,
      this.signers,
      this.hashingProvider,
      this.originChainStateManager,
      this.originChainNavigator,
      this.boundWitnessPayloadProvider
    );

    return new XyoPeerConnectionHandlerImpl(boundWitnessHandlerProvider);
  }
}
