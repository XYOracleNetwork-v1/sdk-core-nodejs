/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 30th November 2018 1:02:10 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 1:05:10 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseHash } from "@xyo-network/hashing"

const SCHEMA_ID_STUB_HASH = 0x0F

export class XyoMockHash extends XyoBaseHash {

  public schemaObjectId = SCHEMA_ID_STUB_HASH

  constructor (private readonly hash: Buffer) {
    super()
  }

  public getHash(): Buffer {
    return this.hash
  }

  public async verifyHash(data: Buffer): Promise<boolean> {
    return true
  }
}
