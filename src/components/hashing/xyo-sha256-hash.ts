/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 10:26:11 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-sha256.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:37:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from './xyo-hash';
import { XyoHashProvider } from '../../hash-provider/xyo-hash-provider';

/**
 * An sha256 hash data object
 */

export class XyoSha256Hash extends XyoHash {

  public static major = 0x03;
  public static minor = 0x05;

  /**
   * Creates a new instance of a XyoSha256Hash
   * @param sha256HashProvider A hash provider for sha256
   * @param sha256Hash The binary representation of the hash itself
   */

  constructor(sha256HashProvider: XyoHashProvider | undefined, sha256Hash: Buffer) {
    super(sha256HashProvider, sha256Hash, XyoSha256Hash.major, XyoSha256Hash.minor);
  }
}
