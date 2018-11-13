/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 3:41:00 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-signed.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 12:50:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../xyo-object';
import { XyoNumberType } from './xyo-number-type';

/**
 * Abstract class to wrap signed numeric data-types in the Xyo Major/Minor
 */
export class XyoNumberSigned extends XyoObject {

  /**
   * Creates a new instance of an XyoNumberSigned
   *
   * @param number The raw number value
   * @param major The major value
   * @param minor The minor value
   * @param size The size in bytes need to represent size of the number. 1, 2, or 4
   */

  constructor (
    public readonly number: number,
    public readonly major: number,
    public readonly minor: number,
    public readonly size: XyoNumberType
  ) {
    super(major, minor);
  }

  public getReadableName(): string {
    return 'number-signed';
  }

  public getReadableValue() {
    return this.number;
  }
}
