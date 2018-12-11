/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 11:29:03 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-simple-peer-connection-delegate.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 7th December 2018 11:44:25 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkProvider, IXyoNetworkProcedureCatalogue, IXyoNetworkPipe } from '@xyo-network/network'
import { IXyoPeerConnectionDelegate, IXyoPeerConnectionHandler } from './@types'
import { XyoBase } from '@xyo-network/base'

export class XyoSimplePeerConnectionDelegate extends XyoBase implements IXyoPeerConnectionDelegate {

  constructor (
    private readonly network: IXyoNetworkProvider,
    private readonly catalogue: IXyoNetworkProcedureCatalogue,
    private readonly peerConnectionHandler: IXyoPeerConnectionHandler
  ) {
    super()
  }

  public async provideConnection() {
    return this.network.find(this.catalogue)
  }

  public stopProvidingConnections() {
    return this.network.stopServer()
  }

  public handlePeerConnection(networkPipe: IXyoNetworkPipe) {
    return this.peerConnectionHandler.handlePeerConnection(networkPipe)
  }
}
