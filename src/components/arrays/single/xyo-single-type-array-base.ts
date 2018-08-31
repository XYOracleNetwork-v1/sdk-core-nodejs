/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 8:49:10 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-base.ts
 * @Last modified by:
 * @Last modified time:
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayBase } from '../xyo-array-base';
import { XyoObject } from '../../xyo-object';
import { XyoError } from '../../xyo-error';

export abstract class XyoSingleTypeArrayBase extends XyoArrayBase {

  public abstract elementMajor: number;
  public abstract elementMinor: number;

  public addElement(element: XyoObject, index: number) {
    if (element.id.value![0] !== this.elementMajor || element.id.value![1] !== this.elementMinor) {
      throw new XyoError(`Can not add element to array, mismatched type`, XyoError.errorType.ERR_INVALID_PARAMETERS);
    }

    super.addElement(element, index);
  }
}
