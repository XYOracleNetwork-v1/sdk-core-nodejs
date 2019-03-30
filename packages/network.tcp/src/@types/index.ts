/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 9:59:05 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 10:35:30 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * A network-address provider must provide network peer candidates
 */
export interface IXyoNetworkAddressProvider {

  /**
   * An iterable interface to provide peers. Eventually this interface
   * should be able to accommodate a sufficiently complex peer-to-peer
   * discovery protocol.
   */

  next(): Promise<IXyoTCPNetworkAddress>
}

/**
 * Basic interface for a network address in TCP
 */
export interface IXyoTCPNetworkAddress {
  host: string
  port: number
}
