/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 9th October 2018 12:45:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-storage.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:07:01 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError } from "../xyo-core-components/xyo-error";
import { XyoStoragePriority } from "../xyo-storage/xyo-storage-priority";

/**
 * The interface for storage in the system. Provides a simple
 * abstraction over a key/value store.
 */

export interface XYOStorageProvider {
  write(
    key: Buffer,
    value: Buffer,
    priority: XyoStoragePriority,
    cache: boolean,
    timeout: number
  ): Promise<XyoError | undefined>;

  read(key: Buffer, timeout: number): Promise<Buffer | undefined>;

  getAllKeys(): Promise<Buffer[]>;

  delete(key: Buffer): Promise<void>;

  containsKey(key: Buffer): Promise<boolean>;
}
