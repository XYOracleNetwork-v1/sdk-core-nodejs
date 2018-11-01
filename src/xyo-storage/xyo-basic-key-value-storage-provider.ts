/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 22nd October 2018 3:52:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-basic-key-value-storage-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 1st November 2018 11:27:09 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoStorageProvider } from "../@types/xyo-storage";
import { XyoInMemoryStorageProvider } from "./xyo-in-memory-storage-provider";
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { XyoError } from "../xyo-core-components/xyo-error";
import { XyoStoragePriority } from "./xyo-storage-priority";
import { XyoBase } from "../xyo-core-components/xyo-base";

export class XyoBasicKeyValueStorageProvider extends XyoInMemoryStorageProvider implements IXyoStorageProvider {

  constructor(private readonly dataFile: string) {
    super(getOrCreateDb(dataFile));
  }

  public async write(
    key: Buffer,
    value: Buffer,
    priority: XyoStoragePriority,
    cache: boolean,
    timeout: number
  ): Promise<XyoError | undefined> {
    await super.write(key, value, priority, cache, timeout);
    await persist(this.dataFile, this.data);
    return;
  }

  public async delete(key: Buffer): Promise<void> {
    await super.delete(key);
    await persist(this.dataFile, this.data);
  }
}

function getOrCreateDb(dataFile: string): {[s: string]: Buffer} {
  const exists = existsSync(dataFile);
  if (exists) {
    const fileContents = readFileSync(dataFile, 'utf8');
    const json = JSON.parse(fileContents);

    return Object.keys(json).reduce((memo: {[s: string]: Buffer}, k) => {
      memo[k] = Buffer.from(json[k]);
      return memo;
    }, {});
  }

  writeFileSync(dataFile, XyoBase.stringify({}), 'utf8');
  return {};
}

function persist(dataFile: string, data: {[s: string]: Buffer}) {
  const transform = Object.keys(data).reduce((memo: {[s: string]: string}, key) => {
    memo[key] = data[key].toString();
    return memo;
  }, {});
  writeFileSync(dataFile, XyoBase.stringify(transform), 'utf8');
}
