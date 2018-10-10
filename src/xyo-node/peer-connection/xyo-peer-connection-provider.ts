/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 9:38:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-connection-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 10th October 2018 4:18:00 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkProvider, IXyoNetworkProcedureCatalogue, IXyoNetworkPipe } from '../../@types/xyo-network';
import { IXyoPeerConnectionDelegate, IXyoPeerConnectionHandler } from '../../@types/xyo-node';
import { XyoBase } from '../../xyo-core-components/xyo-base';

export class XyoPeerConnectionDelegate extends XyoBase implements IXyoPeerConnectionDelegate {

  constructor (
    private readonly network: IXyoNetworkProvider,
    private readonly catalogue: IXyoNetworkProcedureCatalogue,
    private readonly peerConnectionHandler: IXyoPeerConnectionHandler
  ) {
    super();
  }

  public async provideConnection() {
    this.logInfo(`Attempting to provide connection`);
    const pipe = await this.network.find(this.catalogue);
    this.logInfo(`Found peer`);
    return pipe;
  }

  public stopProvidingConnections() {
    return this.network.stopServer();
  }

  public handlePeerConnection(networkPipe: IXyoNetworkPipe) {
    return this.peerConnectionHandler.handlePeerConnection(networkPipe);
  }
}
