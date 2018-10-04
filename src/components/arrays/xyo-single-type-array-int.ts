/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 17th September 2018 10:54:25 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-int.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:37:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArray } from './xyo-array';
import { XyoObject } from '../xyo-object';

/**
 * An XyoSingleTypeArrayInt is a collection of homogenous
 * items who's total size should not exceed 2 ^ 32 - 1 bytes when packed
 *
 * @major 0x01
 * @minor 0x03
 */

export class XyoSingleTypeArrayInt extends XyoArray {

  public static major = 0x01;
  public static minor = 0x03;

  /**
   * Creates a new instance of XyoSingleTypeArrayInt
   *
   * @param elementMajor The homogenous item major value
   * @param elementMinor The homogenous item minor value
   * @param array The underlying collection of homogenous items
   */

  constructor(elementMajor: number, elementMinor: number, array: XyoObject[]) {
    super(elementMajor, elementMinor, XyoSingleTypeArrayInt.major, XyoSingleTypeArrayInt.minor, 4, array);
  }
}
