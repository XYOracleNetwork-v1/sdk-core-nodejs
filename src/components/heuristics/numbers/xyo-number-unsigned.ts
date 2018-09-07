/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 1:15:42 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-unsigned.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 12:47:33 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../xyo-object';
import { XyoNumberType } from './xyo-number-type';

/**
 * Abstract class to wrap unsigned numeric data-types in the Xyo Major/Minor
 */
export class XyoNumberUnsigned extends XyoObject {

  /**
   * Creates a new instance of an XyoNumberUnsigned
   *
   * @param number The raw number value
   * @param major The major value
   * @param minor The minor value
   * @param size The size in bytes need to represent size of the number. 1, 2, or 4
   */

  constructor (
    public readonly number: number,
    major: number,
    minor: number,
    public readonly size: XyoNumberType
  ) {
    super(major, minor);
  }
}
