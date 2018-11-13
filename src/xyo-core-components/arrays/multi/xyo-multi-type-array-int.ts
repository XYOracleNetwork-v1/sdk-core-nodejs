/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 17th September 2018 10:56:16 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-multi-type-array-int.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 12:50:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArray } from '../xyo-array';
import { XyoObject } from '../../xyo-object';

/**
 * An XyoMultiTypeArrayInt is a collection of non-homogenous
 * items who's total size should not exceed 2 ^ 32 - 1 bytes when packed
 */

export class XyoMultiTypeArrayInt extends XyoArray {

  public static major = 0x01;
  public static minor = 0x06;

  /**
   * Creates a new instance of a XyoMultiTypeArrayInt
   *
   * @param array The underlying collection or array
   */

  constructor(array: XyoObject[]) {
    super(undefined, undefined, XyoMultiTypeArrayInt.major, XyoMultiTypeArrayInt.minor, 4, array);
  }

  public getReadableName(): string {
    return 'multi-type-array-int';
  }

  public getReadableValue() {
    return this.array;
  }
}
