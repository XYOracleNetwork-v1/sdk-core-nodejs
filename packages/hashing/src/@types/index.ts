/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 1:03:00 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 4:20:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSerializableObject } from '@xyo-network/serialization'

export interface IXyoHash extends IXyoSerializableObject {
  getHash(): Buffer
  verifyHash(data: Buffer): Promise<boolean>
}

export interface IXyoHashProvider {

  /**
   * Creates a hash for a particular piece of data.
   * Returns an instance of an XyoHash asynchronously
   */

  createHash(data: Buffer): Promise<IXyoHash>

  /**
   * Given a raw piece of data and the raw hash, will return
   * a boolean value asynchronously as to whether the hash
   * corresponds to the data for this hash-provider
   */

  verifyHash(data: Buffer, hash: Buffer): Promise<boolean>
}
