/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 8:53:55 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-multi-type-array-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 30th August 2018 8:54:46 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayBase } from '../xyo-array-base';

export abstract class XyoSingleTypeArrayBase extends XyoArrayBase {
  get typedId () {
    return null;
  }
}
