/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 9:54:28 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base-hash-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 12th October 2018 11:20:18 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from './xyo-hash';
import crypto from 'crypto';
import { XyoError, XyoErrors } from '../xyo-core-components/xyo-error';
import { IXyoHashProvider, IXyoHashFactory } from '../@types/xyo-hashing';

/**
 * A hash provider that wraps and utilizes the natives nodejs hash functionality
 */

export class XyoNativeBaseHashProvider implements IXyoHashProvider {

  /**
   * Creates a new instance of a XyoNativeBaseHashProvider
   * @param hashAlgorithm A natively supported hash algorithm. Any item from `crypto.getHashes()` should work
   * @param xyoHashClass A class reference to the type of XyoHash this is
   */

  constructor (
    private readonly hashAlgorithm: string,
    private readonly xyoHashFactory: IXyoHashFactory
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
          const xyoHashInstance = this.xyoHashFactory.newInstance(this, hashOfData as Buffer);
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
        `Could not locate crypto hash-provider ${this.hashAlgorithm}. ${err}`,
        XyoErrors.CRITICAL
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