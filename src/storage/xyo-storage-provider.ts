/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 3:56:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: storage-provider.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 2:14:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError } from '../components/xyo-error';

export enum XyoStorageProviderPriority {
  /**
   * Used when the write to storage can be slow speed.
   */
  PRIORITY_LOW,

  /**
   * Used when the write to storage must be medium speed.
   */
  PRIORITY_MED,

  /**
   * Used when the write to storage must be high speed.
   */
  PRIORITY_HIGH
}

/**
 * The interface for storage in the system. Provides a simple
 * abstraction over a key/value store.
 */
export interface XYOStorageProvider {
  write(
    key: Buffer,
    value: Buffer,
    priority: XyoStorageProviderPriority,
    cache: boolean,
    timeout: number
  ): Promise<XyoError | undefined>;

  read(key: Buffer, timeout: number): Promise<Buffer | undefined>;

  getAllKeys(): Promise<Buffer[]>;

  delete(key: Buffer): Promise<void>;

  containsKey(key: Buffer): Promise<boolean>;
}
