/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 20th December 2018 12:11:45 pm
 * @Email:  developer@xyfindables.com
 * @Filename: ipfs-http-client.d.ts
 
 * @Last modified time: Thursday, 7th March 2019 9:54:44 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// A very incomplete type definition for ipfs-http-client
// Derived from the canonical source https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#get
// See https://www.npmjs.com/package/ipfs-http-client for extended documentation

declare module 'ipfs-http-client' {
  
  export interface IIpfsInitializationOptions {
    host: string,
    port: string,
    protocol: string
  }

  export interface IIpfsFileDescriptor {
    path: string,
    content: Buffer
  }

  export interface IIpfsAddOptions {
    pin: boolean
  }

  export interface IIpfsAddResultItem {
    path: string
    hash: string
    size: number
  }

  export interface IIpfsClient {
    get(ipfsPath: string | Buffer, cb: (err: Error | undefined, files: IIpfsFileDescriptor[]) => void ): void
    add(data: Buffer, options: IIpfsAddOptions, cb: (err: Error | null, res: IIpfsAddResultItem[]) => void): void
    add(data: Buffer, cb: (err: Error | null, res: IIpfsAddResultItem[]) => void): void
  }

  export default function(options: IIpfsInitializationOptions): IIpfsClient
}