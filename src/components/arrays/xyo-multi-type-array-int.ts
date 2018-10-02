/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 17th September 2018 10:56:16 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-multi-type-array-int.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:37:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArray } from './xyo-array';
import { XyoObject } from '../xyo-object';

/**
 * An XyoMultiTypeArrayInt is a collection of non-homogenous
 * items who's total size should not exceed 2 ^ 32 - 1 bytes when packed
 *
 * @major 0x01
 * @minor 0x06
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
}
