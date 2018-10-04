/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 9:38:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-md5-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:37:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from './xyo-hash';
import { XyoHashProvider } from '../../hash-provider/xyo-hash-provider';

/**
 * An md5 hash data object
 */

export class XyoMd5Hash extends XyoHash {

  public static major = 0x03;
  public static minor = 0x02;

  /**
   * Creates a new instance of a XyoMd5Hash
   * @param md5HashProvider A hash provider for md5
   * @param md5Hash The binary representation of the hash itself
   */

  constructor(md5HashProvider: XyoHashProvider | undefined, md5Hash: Buffer) {
    super(md5HashProvider, md5Hash, XyoMd5Hash.major, XyoMd5Hash.minor);
  }
}
