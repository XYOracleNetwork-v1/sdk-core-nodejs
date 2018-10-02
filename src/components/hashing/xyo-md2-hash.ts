/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 9:38:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-md2-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:37:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from './xyo-hash';
import { XyoHashProvider } from '../../hash-provider/xyo-hash-provider';

/**
 * An md2 hash data object
 */

export class XyoMd2Hash extends XyoHash {

  public static major = 0x03;
  public static minor = 0x01;

  /**
   * Creates a new instance of a XyoMd2Hash
   * @param md2HashProvider A hash provider for md2
   * @param md2Hash The binary representation of the hash itself
   */

  constructor(md2HashProvider: XyoHashProvider | undefined, md2Hash: Buffer) {
    super(md2HashProvider, md2Hash, XyoMd2Hash.major, XyoMd2Hash.minor);
  }
}
