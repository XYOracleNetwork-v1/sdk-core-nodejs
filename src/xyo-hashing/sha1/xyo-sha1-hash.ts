/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 10:16:56 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-m
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 12:54:35 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from '../xyo-hash';
import { IXyoHashProvider } from '../../@types/xyo-hashing';

/**
 * An sha1 hash data object
 */

export class XyoSha1Hash extends XyoHash {

  public static major = 0x03;
  public static minor = 0x03;

  /**
   * Creates a new instance of a XyoSha1Hash
   * @param sha1HashProvider A hash provider for sha1
   * @param sha1Hash The binary representation of the hash itself
   */

  constructor(sha1HashProvider: IXyoHashProvider | undefined, sha1Hash: Buffer) {
    super(sha1HashProvider, sha1Hash, XyoSha1Hash.major, XyoSha1Hash.minor);
  }

  public getReadableName(): string {
    return 'sha1-hash';
  }

  public getReadableValue() {
    return this.hash;
  }
}
