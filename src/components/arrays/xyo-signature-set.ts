/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 1:18:58 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signature-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 11:11:42 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoArray } from './xyo-array';

/**
 * An XyoSignatureSet is a collection of non-homogenous
 * signatures who's total size should not exceed 2 ^ 16 - 1 bytes when packed
 *
 * @major 0x02
 * @minor 0x03
 */

export class XyoSignatureSet extends XyoArray {

  /**
   * Creates a new instance of a XyoSignatureSet
   *
   * @param array A collection of signatures
   */

  constructor (public readonly array: XyoObject[]) {
    super(undefined, undefined, 0x02, 0x03, 2, array);
  }
}
