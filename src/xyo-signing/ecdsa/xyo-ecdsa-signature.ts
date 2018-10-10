/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 9:41:12 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:29:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSignature } from '../../@types/xyo-signing';
import { XyoObject } from '../../xyo-core-components/xyo-object';

/**
 * A pojo for Ecdsa Signatures
 */
export abstract class XyoEcdsaSignature extends XyoObject implements IXyoSignature {

  public abstract getSignature(): Buffer;
  public abstract verifySign(signature: IXyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean>;

  /**
   * Returns the binary representation of the signature
   */

  get encodedSignature () {
    return this.getSignature();
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
