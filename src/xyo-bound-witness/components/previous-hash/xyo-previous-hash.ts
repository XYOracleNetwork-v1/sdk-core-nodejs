/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 10:38:56 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 12:53:38 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../xyo-core-components/xyo-object';
import { XyoHash } from '../../../xyo-hashing/xyo-hash';

/**
 * The previous-hash concept is a very important part of the preserving
 * the origin chain the in XYO protocol. Given a previous-hash value one
 * can trace back the ordering of origin-blocks.
 */

export class XyoPreviousHash extends XyoObject {

  public static major = 0x02;
  public static minor = 0x06;

  /**
   * Creates a new instance of a `XyoPreviousHash`
   *
   * @param hash The previous hash in the origin chain
   */

  constructor (public readonly hash: XyoHash) {
    super(XyoPreviousHash.major, XyoPreviousHash.minor);
  }

  public getReadableName(): string {
    return 'previous-hash';
  }

  public getReadableValue() {
    return this.hash;
  }

  /**
   * returns true if a previousHash instance is equal to another previousHash instance.
   *
   * This is accomplished by comparing the values of the underlying hashes
   */

  public equals(other: any): boolean {
    if (other === this) {
      return true;
    }

    if (!(other instanceof XyoPreviousHash)) {
      return false;
    }

    const otherPreviousHash = other as XyoPreviousHash;
    return otherPreviousHash.hash.hash.equals(this.hash.hash);
  }
}
