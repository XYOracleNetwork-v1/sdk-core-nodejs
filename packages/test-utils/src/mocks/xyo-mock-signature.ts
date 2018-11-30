/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:46:25 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 10:38:24 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSignature, IXyoPublicKey } from "@xyo-network/signing"

export class XyoMockSignature implements IXyoSignature {

  public static schemaObjectId = 0x0B

  public static deserialize(data: Buffer): XyoMockSignature {
    return new XyoMockSignature(data.toString('hex'))
  }

  public schemaObjectId = XyoMockSignature.schemaObjectId

  constructor (private readonly desiredSignatureHexString: string) {}

  public async verify(data: Buffer, publicKey: IXyoPublicKey): Promise<boolean> {
    return true
  }

  public get encodedSignature (): Buffer {
    return Buffer.from(this.desiredSignatureHexString, 'hex')
  }

  public serialize(): Buffer {
    return this.encodedSignature
  }
}
