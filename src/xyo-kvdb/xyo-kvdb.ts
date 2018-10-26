/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 22nd October 2018 3:12:25 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-kvdb.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 23rd October 2018 4:33:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoStorageProvider } from "../@types/xyo-storage";
import { XyoStoragePriority } from "../xyo-storage/xyo-storage-priority";
import { XyoError } from "../xyo-core-components/xyo-error";

export class XyoKvDb {
  private readonly namespaceKey = Buffer.from('namespaces');

  constructor(private readonly storageProvider: IXyoStorageProvider) {}

  public async getOrCreateNamespace(namespace: string) {
    const namespaceExists = await this.storageProvider.containsKey(this.namespaceKey);
    let namespaceValue: string[] = [];
    let shouldUpdateNamespaceList = false;

    if (namespaceExists) {
      const namespaceBufferValue = await this.storageProvider.read(this.namespaceKey, 60000);
      namespaceValue = JSON.parse(namespaceBufferValue!.toString()) as string[];
      const index = namespaceValue.indexOf(namespace);
      if (index === -1) { // does not ext
        shouldUpdateNamespaceList = true;
        namespaceValue.push(namespace);
      }
    } else {
      shouldUpdateNamespaceList = true;
      namespaceValue.push(namespace);
    }

    if (shouldUpdateNamespaceList) {
      await this.storageProvider.write(
        this.namespaceKey,
        Buffer.from(JSON.stringify(namespaceValue)),
        XyoStoragePriority.PRIORITY_HIGH,
        true,
        60000
      );
    }

    return new XyoNamespacedStorageProvider(this.storageProvider, namespace);
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoNamespacedStorageProvider implements IXyoStorageProvider {
  private readonly namespace: Buffer;

  constructor(private readonly proxyStorageProvider: IXyoStorageProvider, namespace: string) {
    this.namespace = Buffer.from(`${namespace}.`);
  }

  /** Should persist the value for the corresponding key */
  public write(
    key: Buffer,
    value: Buffer,
    priority: XyoStoragePriority,
    cache: boolean,
    timeout: number
  ): Promise<XyoError | undefined> {
    return this.proxyStorageProvider.write(
      this.getProxyKey(key),
      value,
      priority,
      cache,
      timeout
    );
  }

  /** Attempts to the read the value for key, returns `undefined` if it does not exist */
  public async read(key: Buffer, timeout: number): Promise<Buffer | undefined> {
    return this.proxyStorageProvider.read(this.getProxyKey(key), timeout);
  }

  /** Returns a list of all the keys in storage */
  public async getAllKeys(): Promise<Buffer[]> {
    const allKeys = await this.proxyStorageProvider.getAllKeys();
    return allKeys.map((key) => {
      if (key.length < this.namespace.length) {
        return undefined;
      }

      if (!key.slice(0, this.namespace.length).equals(this.namespace)) {
        return undefined;
      }

      return key.slice(this.namespace.length);
    })
    .filter(v => v) as Buffer[];
  }

  /** Removes a key from storage */
  public async delete(key: Buffer): Promise<void> {
    return this.proxyStorageProvider.delete(this.getProxyKey(key));
  }

  /** Returns true if the key exists in storage, false otherwise */
  public async containsKey(key: Buffer): Promise<boolean> {
    return this.proxyStorageProvider.containsKey(this.getProxyKey(key));
  }

  private getProxyKey(key: Buffer) {
    return Buffer.concat([
      this.namespace,
      key
    ]);
  }
}
