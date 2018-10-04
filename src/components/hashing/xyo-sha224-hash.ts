/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 10:22:53 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-sha-224-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:37:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from './xyo-hash';
import { XyoHashProvider } from '../../hash-provider/xyo-hash-provider';

/**
 * An sha224 hash data object
 */

export class XyoSha224Hash extends XyoHash {

  public static major = 0x03;
  public static minor = 0x04;

  /**
   * Creates a new instance of a XyoSha224Hash
   * @param sha224HashProvider A hash provider for sha224
   * @param sha224Hash The binary representation of the hash itself
   */

  constructor(sha224HashProvider: XyoHashProvider | undefined, sha224Hash: Buffer) {
    super(sha224HashProvider, sha224Hash, XyoSha224Hash.major, XyoSha224Hash.minor);
  }
}
