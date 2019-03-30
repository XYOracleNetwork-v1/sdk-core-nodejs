/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 11:37:53 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 9:56:53 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError } from "@xyo-network/errors"

/**
 * The interface for storage in the system. Provides a simple
 * abstraction over a key/value store.
 */

export interface IXyoStorageProvider {
  /** Should persist the value for the corresponding key */
  write(key: Buffer, value: Buffer): Promise<XyoError | undefined>

  /** Attempts to the read the value for key, returns `undefined` if it does not exist */
  read(key: Buffer): Promise<Buffer | undefined>

  /** Returns a list of all the keys in storage */
  getAllKeys(): Promise<Buffer[]>

  /** Removes a key from storage */
  delete(key: Buffer): Promise<void>

  /** Returns true if the key exists in storage, false otherwise */
  containsKey(key: Buffer): Promise<boolean>
}

/**
 * An extension of the IXyoStorageProvider that provides the feature of being
 * able to iterate over a set of keys
 */
export interface IXyoIterableStorageProvider extends IXyoStorageProvider {
  iterate(options: { offsetKey?: Buffer, limit?: number }): Promise<IXyoStorageIterationResult>
}

/**
 * The result of an iteration request that provides some meta data
 */
export interface IXyoStorageIterationResult {
  items: IXyoBufferKeyValuePair[]
  hasMoreItems: boolean
}

/**
 * A simple key/value pair where the key and the values are both Buffers
 */
export interface IXyoBufferKeyValuePair {
  key: Buffer
  value: Buffer
}
