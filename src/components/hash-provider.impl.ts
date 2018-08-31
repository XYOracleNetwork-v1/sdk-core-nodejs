/*
* @Author: XY | The Findables Company <ryanxyo>
* @Date:   Friday, 17th August 2018 9:32:32 am
* @Email:  developer@xyfindables.com
* @Filename: hash-provider.impl.ts
* @Last modified by: ryanxyo
* @Last modified time: Friday, 17th August 2018 11:22:28 am
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/

import { IHashProvider } from '../types/hash-provider';
import crypto from 'crypto';
import { XyoResult } from './xyo-result';

/**
 * A `HashProvider` is meant to abstract the consumer from hash
 * configuration and implementation details.
 */
export class HashProvider implements IHashProvider {

  /**
   * Creates a hash of the data provided returns the response as a byte-representation
   *
   * @param data The data to hash
   * @returns The resulting hash
   */

  public async hash(data: Buffer): Promise<Buffer> {
    const hash = crypto.createHash(`sha256`);
    return new Promise((resolve, reject) => {
      hash.on('readable', () => {
        return resolve(hash.read() as Buffer);
      });

      hash.write(data);
      hash.end();
    }) as Promise<Buffer>;
  }

  /**
   * Given data and a hash, this will verify that hash corresponds to the data passed in
   * @param data The source data
   * @param hash A hash to to test
   * @returns Will return true (wrapped in an `XyoResult`) if the hash corresponds to the source data, false otherwise
   */

  public async verifyHash(data: Buffer, hash: Uint8Array): Promise<XyoResult<boolean>> {
    const actualHash = await this.hash(data);
    return XyoResult.withValue(actualHash.equals(hash));
  }
}
