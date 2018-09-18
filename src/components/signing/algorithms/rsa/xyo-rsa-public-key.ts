/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 5:02:15 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-public-key.ts
 * @Last modified by:
 * @Last modified time:
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../xyo-object';

/**
 * An RSA public key
 *
 * @major: 0x04
 * @minor: 0x03
 */

export class XyoRsaPublicKey extends XyoObject {

  /**
   * Creates a new instance of a XyoRsaPublicKey
   * @param modulus The modulus in an RSA crypto keypair
   */

  constructor(public readonly modulus: Buffer) {
    super(0x04, 0x03);
  }

  /**
   * The public exponent in the RSA crypto algorithm. Returns
   * the conventional (2 ^ 16) + (2^0) value used in many RSA configurations.
   */

  get publicExponent() {
    return Buffer.from([0x01, 0x00, 0x01]);
  }
}
