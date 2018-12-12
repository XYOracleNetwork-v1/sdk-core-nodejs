/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:44:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-stub-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:37:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoPublicKey } from "./@types"
import { schema } from "@xyo-network/serialization-schema"
import { XyoBaseSerializable, IXyoSerializationService } from '@xyo-network/serialization'

export class XyoStubPublicKey extends XyoBaseSerializable implements IXyoPublicKey {
  public static schemaObjectId = schema.stubPublicKey.id

  public static deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoStubPublicKey {
    const parsed = serializationService.parse(data)
    return new XyoStubPublicKey((parsed.data as Buffer).toString('hex'))
  }

  public schemaObjectId = schema.stubPublicKey.id

  constructor(private readonly publicKeyHexString: string) {
    super(schema)
  }

  public getRawPublicKey(): Buffer {
    return Buffer.from(this.publicKeyHexString, 'hex')
  }

  public getData(): Buffer {
    return this.getRawPublicKey()
  }

  public getReadableValue() {
    return this.getRawPublicKey().toString('hex')
  }
}
