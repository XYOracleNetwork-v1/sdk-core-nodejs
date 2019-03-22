/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 26th February 2019 12:13:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-sha3-hash-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 26th February 2019 12:40:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable-next-line:no-reference
/// <reference path="./@types/eth-lib.d.ts" />
import { hash as ethLibHash } from 'eth-lib'
import { IXyoHashProvider, IXyoHash } from './@types'
import { XyoHash } from './xyo-hash'
import { schema } from "@xyo-network/serialization-schema"

export class XyoSha3HashProvider implements IXyoHashProvider {

  public async createHash(data: Buffer): Promise<IXyoHash> {
    const hash = ethLibHash.keccak256(data.toString())
    const bufHash = Buffer.from(hash.slice(2), 'hex')
    return new XyoHash(bufHash, this, schema.sha3Hash.id)
  }

  public async verifyHash(data: Buffer, hash: Buffer): Promise<boolean> {
    return (await this.createHash(data)).getHash().equals(hash)
  }

}
