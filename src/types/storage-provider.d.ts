/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 3:56:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: storage-provider.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 17th August 2018 4:33:29 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IStorageProvider {
  put(key: Buffer, value: Buffer): Promise<boolean>;
  get(key: Buffer): Promise<Buffer|undefined>;
  getAllKeys(): Promise<Buffer[]>;
  remove(key: Buffer): Promise<boolean>;
  containsKey(key: Buffer): Promise<boolean>;
  containsValue(value: Buffer): Promise<boolean>;
}