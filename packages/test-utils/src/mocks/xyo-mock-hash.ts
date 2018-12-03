/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 30th November 2018 1:02:10 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 3rd December 2018 9:26:43 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseHash } from "@xyo-network/hashing"
import { schema } from "@xyo-network/serialization-schema"

export class XyoMockHash extends XyoBaseHash {

  public schemaObjectId = schema.stubHash.id

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
