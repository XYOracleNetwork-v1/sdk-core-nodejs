/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 30th November 2018 12:50:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash-deserializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 12:58:38 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDeserializer, parse, ParseQuery } from "@xyo-network/serialization"
import { IXyoHash } from "@xyo-network/hashing"

export class XyoHashDeserializer implements IXyoDeserializer<IXyoHash> {

  constructor (
    public readonly schemaObjectId: number,
    private hashCreator: (hash: Buffer) => IXyoHash
  ) {

  }

  public deserialize(data: Buffer): IXyoHash {
    const parseResult = parse(data)
    const q = new ParseQuery(parseResult)
    const bufHash = q.readData()
    return this.hashCreator(bufHash)
  }

}
