
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 9:19:54 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bridge-hash-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 5th February 2019 10:11:51 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoSerializableObject, IXyoDeserializer, IXyoSerializationService, ParseQuery } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'
import { IXyoHash } from "@xyo-network/hashing"

export class XyoBridgeHashSet extends XyoBaseSerializable {
  public static deserializer: IXyoDeserializer<XyoBridgeHashSet>

  public schemaObjectId = schema.bridgeHashSet.id

  constructor (public readonly hashSet: IXyoHash[]) {
    super(schema)
  }

  public getData(): IXyoSerializableObject | Buffer | IXyoSerializableObject[] {
    return this.hashSet
  }

  public getReadableValue() {
    return this.hashSet.map(hash => hash.getReadableValue())
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoBridgeHashSetDeserializer implements IXyoDeserializer<XyoBridgeHashSet> {
  public readonly schemaObjectId = schema.bridgeHashSet.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoBridgeHashSet {
    const parseResult = serializationService.parse(data)
    const query = new ParseQuery(parseResult)
    return new XyoBridgeHashSet(
      query.mapChildren(
        hash => serializationService.deserialize(hash.readData(true)).hydrate<IXyoHash>())
    )
  }
}

XyoBridgeHashSet.deserializer = new XyoBridgeHashSetDeserializer()
