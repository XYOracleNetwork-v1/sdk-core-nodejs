/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:07:21 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha256-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 18th September 2018 1:50:57 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaSignature } from './xyo-rsa-signature';
import { XyoSignature } from '../../xyo-signature';
import { XyoObject } from '../../../xyo-object';

/**
 * Wraps an RSA-Sha256 Signature with some verification functionality
 *
 * @major 0x05
 * @minor 0x08
 */

export class XyoRSASha256Signature extends XyoRsaSignature {

  /**
   * Creates a new instance of a XyoRSASha256Signature
   *
   * @param signature The raw RSASha256 signature
   * @param verifySign A signature verifier
   */

  constructor(
    signature: Buffer,
    private readonly verifySign: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>) {
    super(signature, Buffer.from([0x05, 0x08]));
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
