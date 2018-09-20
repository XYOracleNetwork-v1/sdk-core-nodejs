/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 9:41:12 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 20th September 2018 1:49:08 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSignature } from '../../xyo-signature';
import { XyoObject } from '../../../xyo-object';

/**
 * A pojo for Ecdsa Signatures
 */
export class XyoEcdsaSignature extends XyoSignature {

  /**
   * Creates new instance of a `XyoEcdsaSignature`
   *
   * @param signature The raw signature
   * @param rawId
   */

  constructor(
    public readonly signature: Buffer,
    rawId: Buffer,
    private readonly verifySign: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>
  ) {
    super(rawId[0], rawId[1]);
  }

  /**
   * Returns the binary representation of the signature
   */

  get encodedSignature () {
    return this.signature;
  }

  /**
   * Verifies that this signature is valid
   *
   * @param data The data that was signed
   * @param publicKey The public key associated with the crypto key-pair
   */

  public async verify (data: Buffer, publicKey: XyoObject): Promise<boolean> {
    return this.verifySign(this, data, publicKey);
  }
}
