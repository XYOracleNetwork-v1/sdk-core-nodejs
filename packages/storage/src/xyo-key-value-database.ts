/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 1:25:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-key-value-database.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 9:58:22 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoStorageProvider } from "./@types"
import { XyoError } from '@xyo-network/errors'
import { XyoBase } from "@xyo-network/base"

/**
 * Provides namespaces for an otherwise non-namespaced storage-provider
 *
 * @export
 * @class XyoKeyValueDatabase
 * @extends {XyoBase}
 */
export class XyoKeyValueDatabase extends XyoBase {

  private readonly namespaceKey = Buffer.from('namespaces')

  /**
   * Creates an instance of XyoKeyValueDatabase.
   * @param {IXyoStorageProvider} storageProvider The storage provider that will store the namespaces
   * @memberof XyoKeyValueDatabase
   */
  constructor(private readonly storageProvider: IXyoStorageProvider) {
    super()
  }

  /**
   * Get or creates a namespace in the storage provider. The `IXyoStorageProvider` returned
   * is a storage provider in the protected namespace
   *
   * @param {string} namespace
   * @returns {Promise<IXyoStorageProvider>}
   * @memberof XyoKeyValueDatabase
   */
  public async getOrCreateNamespace(namespace: string): Promise<IXyoStorageProvider> {
    const namespaceExists = await this.storageProvider.containsKey(this.namespaceKey)
    let namespaceValue: string[] = []
    let shouldUpdateNamespaceList = false

    if (namespaceExists) {
      const namespaceBufferValue = await this.storageProvider.read(this.namespaceKey)
      namespaceValue = JSON.parse(namespaceBufferValue!.toString()) as string[]
      const index = namespaceValue.indexOf(namespace)
      if (index === -1) { // does not ext
        shouldUpdateNamespaceList = true
        namespaceValue.push(namespace)
      }
    } else {
      shouldUpdateNamespaceList = true
      namespaceValue.push(namespace)
    }

    if (shouldUpdateNamespaceList) {
      await this.storageProvider.write(
        this.namespaceKey,
        Buffer.from(XyoBase.stringify(namespaceValue))
      )
    }

    return new XyoNamespacedStorageProvider(this.storageProvider, namespace)
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoNamespacedStorageProvider implements IXyoStorageProvider {
  private readonly namespace: Buffer

  constructor(private readonly proxyStorageProvider: IXyoStorageProvider, namespace: string) {
    this.namespace = Buffer.from(`${namespace}.`)
  }

  /** Should persist the value for the corresponding key */
  public write(key: Buffer, value: Buffer): Promise<XyoError | undefined> {
    return this.proxyStorageProvider.write(this.getProxyKey(key), value)
  }

  /** Attempts to the read the value for key, returns `undefined` if it does not exist */
  public async read(key: Buffer): Promise<Buffer | undefined> {
    return this.proxyStorageProvider.read(this.getProxyKey(key))
  }

  /** Returns a list of all the keys in storage */
  public async getAllKeys(): Promise<Buffer[]> {
    const allKeys = await this.proxyStorageProvider.getAllKeys()
    return allKeys.map((key) => {
      if (key.length < this.namespace.length) {
        return undefined
      }

      if (!key.slice(0, this.namespace.length).equals(this.namespace)) {
        return undefined
      }

      return key.slice(this.namespace.length)
    })
    .filter(v => v) as Buffer[]
  }

  /** Removes a key from storage */
  public async delete(key: Buffer): Promise<void> {
    return this.proxyStorageProvider.delete(this.getProxyKey(key))
  }

  /** Returns true if the key exists in storage, false otherwise */
  public async containsKey(key: Buffer): Promise<boolean> {
    return this.proxyStorageProvider.containsKey(this.getProxyKey(key))
  }

  private getProxyKey(key: Buffer) {
    return Buffer.concat([
      this.namespace,
      key
    ])
  }
}
