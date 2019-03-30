/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 3:35:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: rsa-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:54:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSignature, IXyoPublicKey } from '@xyo-network/signing'
import { XyoBaseSerializable } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'

/**
 * An RSA signature
 */
export class XyoRsaSignature extends XyoBaseSerializable implements IXyoSignature {

  constructor (
    public readonly rawSignature: Buffer,
    public readonly verifySign: (signature: IXyoSignature, data: Buffer, publicKey: IXyoPublicKey) => Promise<boolean>,
    public readonly schemaObjectId: number
  ) {
    super(schema)
  }

  public getData(): Buffer {
    return this.rawSignature
  }

  /**
   * Returns the binary-representation of the signature
   */

  get encodedSignature (): Buffer {
    return this.rawSignature
  }

  /**
   * Verifies that this signature is valid
   *
   * @param data The data that was signed
   * @param publicKey The public key associated with the crypto key-pair
   */

  public async verify (data: Buffer, publicKey: IXyoPublicKey): Promise<boolean> {
    return this.verifySign(this, data, publicKey)
  }

  public getReadableValue() {
    return this.encodedSignature.toString('hex')
  }
}
