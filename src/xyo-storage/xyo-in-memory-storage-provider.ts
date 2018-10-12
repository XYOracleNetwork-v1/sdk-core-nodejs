/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 4:00:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: in-memory.storage-provider.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 1:16:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoStoragePriority } from './xyo-storage-priority';
import { IXyoStorageProvider } from '../@types/xyo-storage';
import { XyoError, XyoErrors } from '../xyo-core-components/xyo-error';

/**
 * The In-Memory Storage Provider implements the IStorageProvider
 * interface. It only provide persistance at the process level and
 * does not persist beyond the lifetime of the application
 */

export class XyoInMemoryStorageProvider implements IXyoStorageProvider {

  /** A simple key value map to map addresses to values */
  private readonly data: {[s: string]: Buffer} = {};

  /**
   * Attempts to save value `value` for key `key`
   *
   * @param key The location identifer
   * @param value The value which to store
   * @returns Will return if the value is stored successfully
   */

  public async write(
    key: Buffer,
    value: Buffer,
    priority: XyoStoragePriority,
    cache: boolean,
    timeout: number
  ): Promise<XyoError | undefined> {
    this.data[key.toString()] = value;
    return;
  }

  /**
   * Attempts to retrieve a value corresponding to the location identifier `key`
   * @param key The location identifer
   * @return Will return the value if it can be located, `undefined` otherwise
   */

  public async read(key: Buffer, timeout: number): Promise<Buffer | undefined> {
    const result = this.data[key.toString()];
    return result;
  }

  /**
   * Returns a list of the all they `keys` or location identifiers in storage
   */

  public async getAllKeys(): Promise<Buffer[]> {
    return Object.keys(this.data).map((key) => {
      return Buffer.from(key);
    });
  }

  /**
   * Will attempt to remove a value for location identifier `key`
   * @param key
   * @return Will return true if the key existed and was removed successfully, false otherwise
   */

  public async delete(key: Buffer): Promise<void> {
    const value = this.data[key.toString()];
    if (!value) {
      throw new XyoError(`Unable to delete ${key}, does not exist`, XyoErrors.INVALID_PARAMETERS);
    }

    delete this.data[key.toString()];
  }

  /**
   * Queries the storage provider as to whether there is a key/value
   * in storage
   * @param key The location identifier to query against
   * @returns Returns true if value exists for key `key`
   */

  public async containsKey(key: Buffer): Promise<boolean> {
    return this.data[key.toString()] !== undefined;
  }
}
