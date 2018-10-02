/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 1:22:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-key-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:37:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArray } from './xyo-array';
import { XyoObject } from '../xyo-object';

/**
 * A non-homogenous wrapper class for a collections of different keys
 *
 * @major 0x02
 * @minor 0x02
 */

export class XyoKeySet extends XyoArray {

  public static major = 0x02;
  public static minor = 0x02;

  /**
   * Creates a new instance of an XyoKeySet
   *
   * @param array The collection of keys to wrap
   */

  constructor (public readonly array: XyoObject[]) {
    super(undefined, undefined, XyoKeySet.major, XyoKeySet.minor, 2, array);
  }
}
