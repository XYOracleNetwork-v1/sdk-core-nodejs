/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 26th September 2018 9:49:22 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bridge-block-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 11:58:45 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArray } from "./xyo-array";
import { XyoBoundWitness } from "../../xyo-bound-witness/xyo-bound-witness";
import { XyoHashProvider } from '../../@types/xyo-hashing';
import { XyoBridgeHashSet } from "./xyo-bridge-hash-set";

export class XyoBridgeBlockSet extends XyoArray {

  public static major = 0x02;
  public static minor = 0x09;

  /**
   * Creates a new instance of a XyoBridgeBlockSet
   *
   * @param array The collection of blocks to wrap
   */

  constructor (public readonly array: XyoBoundWitness[]) {
    super(XyoBoundWitness.major, XyoBoundWitness.minor, XyoBridgeBlockSet.major, XyoBridgeBlockSet.minor, 2, array);
  }

  public async getHashSet(hashProvider: XyoHashProvider) {
    const hashes = await Promise.all(this.array.map((boundWitness) => {
      return boundWitness.getHash(hashProvider);
    }));

    return new XyoBridgeHashSet(hashes);
  }
}
