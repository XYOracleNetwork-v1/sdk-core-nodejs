/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 9:38:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-md5-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 18th September 2018 10:36:30 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from './xyo-hash';
import { XyoHashProvider } from '../../hash-provider/xyo-hash-provider';

/**
 * An md5 hash data object
 */

export class XyoMd5Hash extends XyoHash {

  /**
   * Creates a new instance of a XyoMd5Hash
   * @param md5HashProvider A hash provider for md5
   * @param md5Hash The binary representation of the hash itself
   */

  constructor(md5HashProvider: XyoHashProvider | undefined, md5Hash: Buffer) {
    super(md5HashProvider, md5Hash, 0x03, 0x02);
  }
}
