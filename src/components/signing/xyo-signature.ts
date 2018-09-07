/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 4:02:07 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 1:21:22 pm
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
}
