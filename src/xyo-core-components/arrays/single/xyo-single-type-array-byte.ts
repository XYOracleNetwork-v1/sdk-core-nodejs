/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 17th September 2018 10:48:04 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-byte.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 4:54:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArray } from '../xyo-array';
import { IXyoObject } from '../../xyo-object';

/**
 * An XyoSingleTypeArrayByte is a collection of homogenous
 * items who's total size should not exceed 2 ^ 8 - 1 bytes when packed
 */

export class XyoSingleTypeArrayByte extends XyoArray {

  public static major = 0x01;
  public static minor = 0x01;

  /**
   * Creates a new instance of XyoSingleTypeArrayByte
   *
   * @param elementMajor The homogenous item major value
   * @param elementMinor The homogenous item minor value
   * @param array The underlying collection of homogenous items
   */

  constructor(elementMajor: number, elementMinor: number, array: IXyoObject[]) {
    super(elementMajor, elementMinor, XyoSingleTypeArrayByte.major, XyoSingleTypeArrayByte.minor, 1, array);
  }

  public getReadableName(): string {
    return 'single-type-array-byte';
  }

  public getReadableValue() {
    return this.array;
  }
}
