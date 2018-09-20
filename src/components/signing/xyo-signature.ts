/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 4:02:07 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 20th September 2018 1:47:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';

/**
 * A base-class for signature objects
 */

export abstract class XyoSignature extends XyoObject {

  /**
   * Subclasses will return a binary-representation of the signature
   */

  public abstract encodedSignature: Buffer;

  /**
   * Verifies that this signature is valid
   *
   * @param data The data that was signed
   * @param publicKey The public key associated with the crypto key-pair
   */
  public abstract verify (data: Buffer, publicKey: XyoObject): Promise<boolean>;
}
