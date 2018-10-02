/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 4:37:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 12:24:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSignature } from '../xyo-signature';
import { XyoObject } from '../../components/xyo-object';

/**
 * An RSA signature
 */
export abstract class XyoRsaSignature extends XyoSignature {

  public abstract readonly rawSignature: Buffer;
  public abstract verifySign(signature: XyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean>;

  /**
   * Returns the binary-representation of the signature
   */

  get encodedSignature () {
    return this.rawSignature;
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
