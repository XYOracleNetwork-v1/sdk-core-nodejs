/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:44:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-stub-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 11:06:36 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoPublicKey } from "./@types"
import { schema } from "@xyo-network/serialization-schema"
import { XyoBaseSerializable, parse, IXyoSerializationService } from '@xyo-network/serialization'

export class XyoStubPublicKey extends XyoBaseSerializable implements IXyoPublicKey {
  public static schemaObjectId = schema.stubPublicKey.id

  public static deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoStubPublicKey {
    const parsed = parse(data, serializationService.schema)
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
}
