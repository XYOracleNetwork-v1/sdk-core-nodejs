/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 3:23:43 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 3:24:34 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoPublicKey } from '@xyo-network/signing'
import { XyoBase } from '@xyo-network/base'

export class XyoRsaPublicKey extends XyoBase implements IXyoPublicKey {

  /**
   * Creates a new instance of a XyoRsaPublicKey
   *
   * @param modulus The modulus in an RSA crypto key-pair
   */

  constructor(public readonly modulus: Buffer) {
    super()
  }

  public getReadableName(): string {
    return 'rsa-public-key'
  }

  public getReadableValue() {
    return this.getRawPublicKey()
  }

  /**
   * The public exponent in the RSA crypto algorithm. Returns
   * the conventional (2 ^ 16) + (2^0) value used in many RSA configurations.
   */

  get publicExponent() {
    return Buffer.from([0x01, 0x00, 0x01])
  }

  public getRawPublicKey() {
    return this.modulus
  }
}
