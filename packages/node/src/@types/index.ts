/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 10:46:01 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 10:53:53 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe } from '@xyo-network/network'

/** A delegate for managing peer-connections */
export interface IXyoPeerConnectionDelegate {

  /** Handles a peer connection once it is provided */
  handlePeerConnection(networkPipe: IXyoNetworkPipe): Promise<void>

  /** Provides a connection to a peer */
  provideConnection(): Promise<IXyoNetworkPipe>

  /** Calling `stopProvidingConnections` will make it so that the delegate does not provide any future connections */
  stopProvidingConnections(): Promise<void>
}
