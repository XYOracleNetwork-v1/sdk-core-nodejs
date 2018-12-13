/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 30th November 2018 1:02:10 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-stub-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 12:19:30 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseHash } from "./xyo-base-hash"
import { schema } from "@xyo-network/serialization-schema"
import { IXyoSerializationService } from "@xyo-network/serialization"

export class XyoStubHash extends XyoBaseHash {

  public static schemaObjectId = schema.stubHash.id

  public static deserialize(data: Buffer, serializationService: IXyoSerializationService) {
    const parseResult = serializationService.parse(data)
    return new XyoStubHash(parseResult.data as Buffer)
  }

  public schemaObjectId = schema.stubHash.id

  constructor (private readonly hash: Buffer) {
    super(schema)
  }

  public getHash(): Buffer {
    return this.hash
  }

  public async verifyHash(data: Buffer): Promise<boolean> {
    return true
  }
}
