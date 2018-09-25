/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 17th September 2018 10:48:04 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-byte.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 11:17:43 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArray } from './xyo-array';
import { XyoObject } from '../xyo-object';

/**
 * An XyoSingleTypeArrayByte is a collection of homogenous
 * items who's total size should not exceed 2 ^ 8 - 1 bytes when packed
 *
 * @major 0x01
 * @minor 0x01
 */

export class XyoSingleTypeArrayByte extends XyoArray {

  /**
   * Creates a new instance of XyoSingleTypeArrayByte
   *
   * @param elementMajor The homogenous item major value
   * @param elementMinor The homogenous item minor value
   * @param array The underlying collection of homogenous items
   */

  constructor(elementMajor: number, elementMinor: number, array: XyoObject[]) {
    super(elementMajor, elementMinor, 0x01, 0x01, 1, array);
  }
}