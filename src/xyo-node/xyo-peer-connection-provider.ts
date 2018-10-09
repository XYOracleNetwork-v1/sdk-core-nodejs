/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 9:38:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-connection-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:05:45 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNetworkProviderInterface, XyoNetworkProcedureCatalogue, XyoNetworkPipe } from '../@types/xyo-network';
import { XyoPeerConnectionDelegateInterface, XyoPeerConnectionHandlerInterface } from '../@types/xyo-node';

export class XyoPeerConnectionDelegate implements XyoPeerConnectionDelegateInterface {

  constructor (
    private readonly network: XyoNetworkProviderInterface,
    private readonly catalogue: XyoNetworkProcedureCatalogue,
    private readonly peerConnectionHandler: XyoPeerConnectionHandlerInterface
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
