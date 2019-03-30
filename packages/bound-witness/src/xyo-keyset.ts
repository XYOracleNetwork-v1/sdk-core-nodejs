/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 10:08:31 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-keyset.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:50:46 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoSerializableObject, IXyoDeserializer, IXyoSerializationService, ParseQuery } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'
import { IXyoPublicKey } from "@xyo-network/signing"

export class XyoKeySet extends XyoBaseSerializable {
  public static deserializer: IXyoDeserializer<XyoKeySet>
  public schemaObjectId = schema.keySet.id

  constructor (public readonly keys: IXyoPublicKey[], org?: Buffer) {
    super(schema, org)
  }

  public getData(): IXyoSerializableObject[] {
    return this.keys
  }

  public getReadableValue() {
    return this.keys.map(key => key.getReadableValue())
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoKeySetDeserializer implements IXyoDeserializer<XyoKeySet> {
  public schemaObjectId = schema.keySet.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoKeySet {
    const parseResult = serializationService.parse(data)
    const query = new ParseQuery(parseResult)
    const keys = query.mapChildren(key => serializationService.deserialize(key.readData(true)).hydrate<IXyoPublicKey>())
    return new XyoKeySet(keys, data)
  }
}

XyoKeySet.deserializer = new XyoKeySetDeserializer()
