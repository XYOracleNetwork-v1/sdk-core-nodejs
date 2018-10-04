/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 9:38:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-connection-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:25:08 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNetworkProviderInterface, XyoNetworkProcedureCatalogue, XyoNetworkPipe } from '../network/xyo-network';
import { XyoPeerConnectionDelegate, XyoPeerConnectionHandler } from './xyo-node-types';

export class XyoPeerConnectionDelegateImpl implements XyoPeerConnectionDelegate {

  constructor (
    private readonly network: XyoNetworkProviderInterface,
    private readonly catalogue: XyoNetworkProcedureCatalogue,
    private readonly peerConnectionHandler: XyoPeerConnectionHandler
  ) {}

  public provideConnection() {
    return this.network.find(this.catalogue);
  }

  public stopProvidingConnections() {
    return this.network.stopServer();
  }

  public handlePeerConnection(networkPipe: XyoNetworkPipe) {
    return this.peerConnectionHandler.handlePeerConnection(networkPipe);
  }
}
