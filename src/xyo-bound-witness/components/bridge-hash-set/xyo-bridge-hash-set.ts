/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 26th September 2018 10:22:37 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bridge-hash-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 11:16:24 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArray } from "../../../xyo-core-components/arrays/xyo-array";
import { XyoHash } from "../../../xyo-hashing/xyo-hash";

/**
 * When a bound-witness occurs that is bridging origin blocks from
 * one node to another that a `XyoBridgeBlockSet` in the unsigned payload
 * and a `XyoBridgeHashSet` is passed in the signed payload. This is so
 * that the `XyoBridgeBlockSet` can be removed and handled accordingly
 * and the Bound-Witness still remains valid. However, since the the
 * XyoBridgeHashSet is part of the signatures it may not be removed and
 * exists as a record for attribution as to how a particular node
 * got access to a block or blocks.
 */

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
