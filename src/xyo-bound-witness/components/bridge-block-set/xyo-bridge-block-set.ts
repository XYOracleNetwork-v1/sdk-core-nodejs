/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 26th September 2018 9:49:22 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bridge-block-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 2:25:19 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArray } from "../../../xyo-core-components/arrays/xyo-array";
import { XyoBoundWitness } from "../../bound-witness/xyo-bound-witness";
import { IXyoHashProvider } from '../../../@types/xyo-hashing';
import { XyoBridgeHashSet } from "../bridge-hash-set/xyo-bridge-hash-set";

/**
 * An `XyoBridgeBlockSet` is the data structure that is used to transfer
 * blocks through a bound witness. It can generally be found as part on the
 * unsigned payload of a bound-witness
 */
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

  public getReadableName(): string {
    return 'bridgeBlockSet';
  }

  public getReadableValue() {
    return this.array;
  }

  /**
   * Given a hashProvider, get a bridge-set containing all the hashes
   * of the bound-witnesses in the collection
   */

  public async getHashSet(hashProvider: IXyoHashProvider) {
    const hashes = await Promise.all(this.array.map((boundWitness) => {
      return boundWitness.getHash(hashProvider);
    }));

    return new XyoBridgeHashSet(hashes);
  }
}
