/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 9:41:12 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 12:57:52 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSignature } from '../../xyo-signature';

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

  constructor(public readonly signature: Buffer, rawId: Buffer) {
    super(rawId[0], rawId[1]);
  }

  /**
   * Returns the binary representation of the signature
   */

  get encodedSignature () {
    return this.signature;
  }
}
