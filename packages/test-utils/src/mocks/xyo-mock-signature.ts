/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:46:25 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 4:49:20 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSignature, IXyoPublicKey } from "@xyo-network/signing"

export class XyoMockSignature implements IXyoSignature {

  public schemaObjectId = 0x0B

  constructor (private readonly desiredSignatureHexString: string) {}

  public async verify(data: Buffer, publicKey: IXyoPublicKey): Promise<boolean> {
    return data.toString('hex') === this.desiredSignatureHexString
  }

  public get encodedSignature (): Buffer {
    return Buffer.from(this.desiredSignatureHexString, 'hex')
  }

  public serialize(): Buffer {
    return this.encodedSignature
  }
}
