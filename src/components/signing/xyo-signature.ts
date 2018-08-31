/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 4:02:07 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 30th August 2018 4:03:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';

export abstract class XyoSignature extends XyoObject {
  public abstract encodedSignature: Buffer;
}
