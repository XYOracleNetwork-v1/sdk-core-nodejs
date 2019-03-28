/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 1:16:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 13th December 2018 11:51:36 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, IXyoSerializableObject, ParseQuery } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'
import { IXyoHash } from "@xyo-network/hashing"

export class XyoPreviousHash extends XyoBaseSerializable {

  public static deserializer: IXyoDeserializer<XyoPreviousHash>
  public readonly schemaObjectId = schema.previousHash.id

  constructor (public readonly hash: IXyoHash, original?: Buffer) {
    super(schema, original)
  }

  public getData(): IXyoSerializableObject[] | Buffer {
    return [this.hash]
  }

  public getReadableValue () {
    return this.hash.getReadableValue()
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoPreviousHashDeserializer implements IXyoDeserializer<XyoPreviousHash> {
  public readonly schemaObjectId = schema.previousHash.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoPreviousHash {
    const parseResult = serializationService.parse(data)
    const query = new ParseQuery(parseResult)

    return new XyoPreviousHash(
      serializationService.deserialize(query.getChildAt(0).readData(true)).hydrate<IXyoHash>(),
      data
    )
  }
}

XyoPreviousHash.deserializer = new XyoPreviousHashDeserializer()
