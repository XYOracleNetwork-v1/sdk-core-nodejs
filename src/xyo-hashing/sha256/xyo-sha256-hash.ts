/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 10:26:11 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-sha256.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 12:56:14 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from '../xyo-hash';
import { IXyoHashProvider } from '../../@types/xyo-hashing';

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

  constructor(sha256HashProvider: IXyoHashProvider | undefined, sha256Hash: Buffer) {
    super(sha256HashProvider, sha256Hash, XyoSha256Hash.major, XyoSha256Hash.minor);
  }

  public getReadableName(): string {
    return 'sha256Hash';
  }

  public getReadableValue() {
    return this.hash;
  }
}
