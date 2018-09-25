/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 4:37:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 20th September 2018 1:47:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSignature } from '../../xyo-signature';

/**
 * An RSA signature
 */
export abstract class XyoRsaSignature extends XyoSignature {

  /**
   * Creates an new instance of a `XyoRsaSignature`
   * @param rawSignature The binary representation of the signature
   * @param rawId The particular RSA signature configuration id
   */

  constructor (public readonly rawSignature: Buffer, public readonly rawId: Buffer) {
    super(rawId[0], rawId[1]);
  }

  /**
   * Returns the binary-representation of the signature
   */

  get encodedSignature () {
    return this.rawSignature;
  }
}
