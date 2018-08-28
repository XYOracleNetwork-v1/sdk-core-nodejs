/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 4:00:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: in-memory.storage-provider.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 4:15:20 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IStorageProvider } from '../types/storage-provider';

/**
 * The In-Memory Storage Provider implements the IStorageProvider
 * interface. It only provide persistance at the process level and
 * does not persist beyond the lifetime of the application
 */
export class InMemoryStorageProvider implements IStorageProvider {

  /** A simple key value map to map addresses to values */
  private readonly data: {[s: string]: Buffer} = {};

  /**
   * Attempts to save value `value` for key `key`
   *
   * @param key The location identifer
   * @param value The value which to store
   * @returns Will return if the value is stored successfully
   */

  public async put(key: Buffer, value: Buffer): Promise<boolean> {
    this.data[key.toString()] = value;
    return true;
  }

  /**
   * Attempts to retrieve a value corresponding to the location identifier `key`
   * @param key The location identifer
   * @return Will return the value if it can be located, `undefined` otherwise
   */

  public async get(key: Buffer): Promise<Buffer|undefined> {
    return this.data[key.toString()];
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

  public async remove(key: Buffer): Promise<boolean> {
    const value = this.data[key.toString()];
    delete this.data[key.toString()];
    return value !== undefined;
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

  /**
   * Queries the storage provider as to whether there is value
   * in storage
   * @param value The value to find
   * @returns Returns true if the storage provider finds a value equal to `value` in storage
   */

  public async containsValue(value: Buffer): Promise<boolean> {
    const keys = Object.keys(this.data);
    for (const key of keys) {
      if (this.data[key] === value) {
        return true;
      }
    }

    return false;
  }
}
