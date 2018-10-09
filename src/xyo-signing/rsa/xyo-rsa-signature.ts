/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 4:37:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:28:57 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSignature } from '../../@types/xyo-signing';
import { XyoObject } from '../../xyo-core-components/xyo-object';

/**
 * An RSA signature
 */
export abstract class XyoRsaSignature  extends XyoObject implements XyoSignature {

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
