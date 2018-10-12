/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 9th October 2018 12:45:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-storage.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 10th October 2018 6:00:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError } from "../xyo-core-components/xyo-error";
import { XyoStoragePriority } from "../xyo-storage/xyo-storage-priority";

/**
 * The interface for storage in the system. Provides a simple
 * abstraction over a key/value store.
 */

export interface IXyoStorageProvider {
  /** Should persist the value for the corresponding key */
  write(
    key: Buffer,
    value: Buffer,
    priority: XyoStoragePriority,
    cache: boolean,
    timeout: number
  ): Promise<XyoError | undefined>;

  /** Attempts to the read the value for key, returns `undefined` if it does not exist */
  read(key: Buffer, timeout: number): Promise<Buffer | undefined>;

  /** Returns a list of all the keys in storage */
  getAllKeys(): Promise<Buffer[]>;

  /** Removes a key from storage */
  delete(key: Buffer): Promise<void>;

  /** Returns true if the key exists in storage, false otherwise */
  containsKey(key: Buffer): Promise<boolean>;
}
