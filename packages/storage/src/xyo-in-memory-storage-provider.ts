/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 1:11:43 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-in-memory-storage-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 22nd February 2019 2:18:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoStorageProvider } from './@types'
import { XyoError } from '@xyo-network/errors'

/**
 * The In-Memory Storage Provider implements the IStorageProvider
 * interface. It only provide persistance at the process level and
 * does not persist beyond the lifetime of the application
 */

export class XyoInMemoryStorageProvider implements IXyoStorageProvider {

  constructor(public readonly data: {[s: string]: Buffer} = {}) {}

  /**
   * Attempts to save value `value` for key `key`
   *
   * @param key The location identifer
   * @param value The value which to store
   * @returns Will return if the value is stored successfully
   */

  public async write(key: Buffer, value: Buffer): Promise<XyoError | undefined> {
    this.data[key.toString()] = value
    return
  }

  /**
   * Attempts to retrieve a value corresponding to the location identifier `key`
   * @param key The location identifer
   * @return Will return the value if it can be located, `undefined` otherwise
   */

  public async read(key: Buffer): Promise<Buffer | undefined> {
    const result = this.data[key.toString()]
    if (!result) {
      return undefined
    }

    return result
  }

  /**
   * Returns a list of the all they `keys` or location identifiers in storage
   */

  public async getAllKeys(): Promise<Buffer[]> {
    return Object.keys(this.data).map((key) => {
      return Buffer.from(key)
    })
  }

  /**
   * Will attempt to remove a value for location identifier `key`
   * @param key
   * @return Will return true if the key existed and was removed successfully, false otherwise
   */

  public async delete(key: Buffer): Promise<void> {
    delete this.data[key.toString()]
  }

  /**
   * Queries the storage provider as to whether there is a key/value
   * in storage
   * @param key The location identifier to query against
   * @returns Returns true if value exists for key `key`
   */

  public async containsKey(key: Buffer): Promise<boolean> {
    return this.data[key.toString()] !== undefined
  }
}
