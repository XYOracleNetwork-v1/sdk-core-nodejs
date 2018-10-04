/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th September 2018 2:24:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-next-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:37:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../components/xyo-object';

/**
 * In the XYO protocol, the next public is important for rolling
 * different crypto key/pairs
 *
 * @major: 0x02
 * @minor: 0x07
 */
export class XyoNextPublicKey extends XyoObject {

  public static major = 0x02;
  public static minor = 0x07;

  /**
   * Creates a new instance of a XyoNextPublicKey
   *
   * @param publicKey The next public key that will be used for verification of origin blocks
   */

  constructor (public readonly publicKey: XyoObject) {
    super(XyoNextPublicKey.major, XyoNextPublicKey.minor);
  }
}
