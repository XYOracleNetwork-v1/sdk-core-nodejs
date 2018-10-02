/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 26th September 2018 10:22:37 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bridge-hash-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:37:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArray } from "./xyo-array";
import { XyoHash } from "../hashing/xyo-hash";

export class XyoBridgeHashSet extends XyoArray {

  public static major = 0x02;
  public static minor = 0x08;
  /**
   * Creates a new instance of a XyoBridgeHashSet
   *
   * @param array The collection of hashes to wrap
   */

  constructor (public readonly array: XyoHash[]) {
    super(undefined, undefined, XyoBridgeHashSet.major, XyoBridgeHashSet.minor, 2, array);
  }
}
