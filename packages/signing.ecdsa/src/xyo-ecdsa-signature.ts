
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 5th December 2018 12:05:59 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:54:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoDeserializer } from '@xyo-network/serialization'
import { IXyoSignature, IXyoPublicKey } from "@xyo-network/signing"
import { schema } from '@xyo-network/serialization-schema'

export class XyoEcdsaSignature extends XyoBaseSerializable implements IXyoSignature {

  public static deserializer: IXyoDeserializer<XyoEcdsaSignature>

  constructor(
    public readonly encodedSignature: Buffer,
    public readonly schemaObjectId: number,
    public readonly verifyFn: (sig: IXyoSignature, data: Buffer, publicKey: IXyoPublicKey) => Promise<boolean>
  ) {
    super(schema)
  }

  public getData() {
    return this.encodedSignature
  }

  public verify(data: Buffer, publicKey: IXyoPublicKey): Promise<boolean> {
    return this.verifyFn(this, data, publicKey)
  }

  public getReadableValue() {
    return this.encodedSignature.toString('hex')
  }
}
