/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 9:24:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 11:26:40 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoPacker } from '../../xyo-packer/xyo-packer';
import { XyoHashToHashProviderMap } from './xyo-hash-to-hash-provider-map';
import { XyoError } from '../xyo-error';

/**
 * Wraps a XyoHash value. Additionally, adds a `verifyHash`
 * instance method that can be used to verify the hash value matches
 * against a set of data
 */
export class XyoHash extends XyoObject {

  /**
   * Creates new instance of XyoBasicHashBase and initializes it with
   * the hash that has already been calculated `pastHash`
   *
   * @param pastHash An already calculated hash value
   */

  constructor(
    private readonly hashToHashProviderMap: XyoHashToHashProviderMap,
    public readonly hash: Buffer,
    public readonly major: number,
    public readonly minor: number
  ) {
    super(major, minor);
  }

  /**
   * Verifies that a hash matches to a source data.
   *
   * @param data The source data to compare to
   */

  public async verifyHash(data: Buffer): Promise<boolean> {
    const hashProvider = this.hashToHashProviderMap.getProvider(this.id[0], this.id[1]);
    if (!hashProvider) {
      throw new XyoError(`Failed to locate hash provider`, XyoError.errorType.ERR_CRITICAL);
    }

    const xyoHash = await hashProvider.createHash(data);
    return xyoHash.hash.equals(this.hash);
  }
}
