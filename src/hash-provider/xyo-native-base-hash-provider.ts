/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 9:54:28 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base-hash-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 1:35:33 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHashProvider } from './xyo-hash-provider';
import { XyoHash } from '../components/hashing/xyo-hash';
import crypto from 'crypto';
import { XyoError } from '../components/xyo-error';

/**
 * A hash provider that wraps and utilizes the natives nodejs hash functionality
 */

export class XyoNativeBaseHashProvider implements XyoHashProvider {

  /**
   * Creates a new instance of a XyoNativeBaseHashProvider
   * @param hashAlgorithm A natively supported hash algorithm. Any item from `crypto.getHashes()` should work
   * @param xyoHashClass A class reference to the type of XyoHash this is
   */

  constructor (
    private readonly hashAlgorithm: string,
    private readonly xyoHashClass: { new(hashProvider: XyoHashProvider | undefined, hash: Buffer): XyoHash}
  ) {}

  /**
   * Creates a hash from the data provided
   * @param data An arbitrary buffer to hash
   */

  public createHash(data: Buffer): Promise<XyoHash> {
    try {
      const hash = crypto.createHash(this.hashAlgorithm);

      const hashPromise = new Promise((resolve, reject) => {
        hash.on('readable', () => {
          const hashOfData = hash.read();
          const xyoHashInstance = new this.xyoHashClass(this, hashOfData as Buffer);
          if (hashOfData) {
            return resolve(xyoHashInstance);
          }
        });
      }) as Promise<XyoHash>;

      hash.write(data);
      hash.end();
      return hashPromise;
    } catch (err) {
      throw new XyoError(
        `Could not locate crypto hash-provider ${this.hashAlgorithm}`,
        XyoError.errorType.ERR_CRITICAL
      );
    }
  }

  /**
   * Verifies the data passed hashes to the hash provides.
   * @param data The original data
   * @param hash The supposed hash of the original data
   */

  public async verifyHash(data: Buffer, hash: Buffer): Promise<boolean> {
    const hashOfData = await this.createHash(data);
    return hashOfData.hash.equals(hash);
  }
}
