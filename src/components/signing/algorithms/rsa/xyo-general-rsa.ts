/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 4:59:25 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-general-rsa.ts
 * @Last modified by:
 * @Last modified time:
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSigningObject } from '../../xyo-signing-object';

// TODO Come back to this
export abstract class XyoGeneralRsa extends XyoSigningObject {

  constructor (public readonly keySize: number) {
    super();
  }
}