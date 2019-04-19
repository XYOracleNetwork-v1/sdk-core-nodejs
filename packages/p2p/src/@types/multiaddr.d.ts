/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Tuesday, 29th January 2019 10:45:00 am
 * @Email:  developer@xyfindables.com
 * @Filename: multiaddr.d.ts
 
 * @Last modified time: Tuesday, 29th January 2019 10:45:28 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

interface IMultiaddr {
  nodeAddress(): IAddress
}

interface IAddress {
  port: number,
  address: string,
}

declare module 'multiaddr' {
  export default function (address: string): IMultiaddr
}