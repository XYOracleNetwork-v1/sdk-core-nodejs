/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 1:43:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-native-base-hash-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:44:38 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import crypto from 'crypto'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoHashProvider, IXyoHash } from './@types'
import { XyoHash } from './xyo-hash'

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
    private readonly hashObjectSchemaId: number
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
          resolve(new XyoHash(hashOfData as Buffer, this, this.hashObjectSchemaId))
        })
      }) as Promise<IXyoHash>

      hash.write(data)
      hash.end()
      return hashPromise
    } catch (err) {
      throw new XyoError(`Could not locate crypto hash-provider ${this.hashAlgorithm}. ${err}`)
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
