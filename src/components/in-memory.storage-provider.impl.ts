/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 4:00:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: in-memory.storage-provider.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 17th August 2018 4:39:08 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IStorageProvider } from '../types/storage-provider';

export class InMemoryStorageProvider implements IStorageProvider {
  private readonly data: {[s: string]: Buffer} = {};

  public async put(key: Buffer, value: Buffer): Promise<boolean> {
    this.data[key.toString()] = value;
    return true;
  }

  public async get(key: Buffer): Promise<Buffer|undefined> {
    return this.data[key.toString()];
  }

  public async getAllKeys(): Promise<Buffer[]> {
    return Object.keys(this.data).map((key) => {
      return Buffer.from(key);
    });
  }

  public async remove(key: Buffer): Promise<boolean> {
    delete this.data[key.toString()];
    return true;
  }

  public async containsKey(key: Buffer): Promise<boolean> {
    return this.data[key.toString()] !== undefined;
  }

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
