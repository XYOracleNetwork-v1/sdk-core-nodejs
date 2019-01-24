/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 12:11:28 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-next-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 23rd January 2019 12:38:37 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, IXyoSerializableObject } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'
import { IXyoPublicKey } from "@xyo-network/signing"

export class XyoNextPublicKey extends XyoBaseSerializable {

  public static deserializer: IXyoDeserializer<XyoNextPublicKey>

  public static get schemaObjectId () {
    return XyoNextPublicKey.deserializer.schemaObjectId
  }

  public readonly schemaObjectId = schema.nextPublicKey.id

  constructor (public readonly publicKey: IXyoPublicKey) {
    super(schema)
  }

  public getData(): IXyoSerializableObject {
    return this.publicKey
  }

  public getReadableValue () {
    return this.publicKey.getReadableValue()
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoNextPublicKeyDeserializer implements IXyoDeserializer<XyoNextPublicKey> {
  public readonly schemaObjectId = schema.nextPublicKey.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoNextPublicKey {
    const parseResult = serializationService.parse(data)
    return new XyoNextPublicKey(
      serializationService.deserialize(parseResult.dataBytes).hydrate<IXyoPublicKey>()
    )
  }
}

XyoNextPublicKey.deserializer = new XyoNextPublicKeyDeserializer()
