/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 1:43:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-native-base-hash-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 2:00:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import crypto from 'crypto'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoHashProvider, IXyoHash } from './@types'

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
    private readonly hashAlgorithm: string
  ) {}

  /**
   * Creates a hash from the data provided
   * @param data An arbitrary buffer to hash
   */

  public createHash(data: Buffer): Promise<IXyoHash> {
    try {
      const hash = crypto.createHash(this.hashAlgorithm)

      const hashPromise = new Promise((resolve, reject) => {
        hash.on('readable', () => {
          const hashOfData = hash.read()
          resolve(new XyoHash(hashOfData as Buffer, this))
        })
      }) as Promise<IXyoHash>

      hash.write(data)
      hash.end()
      return hashPromise
    } catch (err) {
      throw new XyoError(
        `Could not locate crypto hash-provider ${this.hashAlgorithm}. ${err}`,
        XyoErrors.CRITICAL
      )
    }
  }

  /**
   * Verifies the data passed hashes to the hash provides.
   * @param data The original data
   * @param hash The supposed hash of the original data
   */

  public async verifyHash(data: Buffer, hash: Buffer): Promise<boolean> {
    const hashOfData = await this.createHash(data)
    return hashOfData.getHash().equals(hash)
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoHash implements IXyoHash {
  constructor(
    private readonly hash: Buffer,
    private readonly hashProvider: IXyoHashProvider
  ) {}

  public getHash() {
    return this.hash
  }

  public async verifyHash(data: Buffer): Promise<boolean> {
    const dataHash = await this.hashProvider.createHash(data)
    return dataHash.getHash().equals(this.hash)
  }
}
