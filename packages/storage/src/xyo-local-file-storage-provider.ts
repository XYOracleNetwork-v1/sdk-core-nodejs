/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 1:17:17 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-local-file-storage-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 9:58:50 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { IXyoStorageProvider } from "./@types"
import { XyoInMemoryStorageProvider } from "./xyo-in-memory-storage-provider"
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { XyoError } from "@xyo-network/errors"
import { XyoBase } from "@xyo-network/base"

/**
 * Providers a very simple StorageProvider implementation over a file-system.
 */
export class XyoLocalFileStorageProvider extends XyoBase implements IXyoStorageProvider {

  private readonly delegate: XyoInMemoryStorageProvider

  /**
   * Creates an instance of XyoLocalFileStorageProvider.
   * @param {string} dataFile The file that should hold the data
   * @memberof XyoLocalFileStorageProvider
   */
  constructor(private readonly dataFile: string) {
    super()
    this.delegate = new XyoInMemoryStorageProvider(getOrCreateDb(dataFile))
  }

  public read(key: Buffer): Promise<Buffer | undefined> {
    return this.delegate.read(key)
  }

  public getAllKeys(): Promise<Buffer[]> {
    return this.delegate.getAllKeys()
  }

  public containsKey(key: Buffer): Promise<boolean> {
    return this.delegate.containsKey(key)
  }

  public async write(
    key: Buffer,
    value: Buffer
  ): Promise<XyoError | undefined> {
    await this.delegate.write(key, value)
    await persist(this.dataFile, this.delegate.data)
    return
  }

  public async delete(key: Buffer): Promise<void> {
    await this.delegate.delete(key)
    await persist(this.dataFile, this.delegate.data)
  }
}

function getOrCreateDb(dataFile: string): {[s: string]: Buffer} {
  const exists = existsSync(dataFile)
  if (exists) {
    const fileContents = readFileSync(dataFile, 'utf8')
    const json = JSON.parse(fileContents)

    return Object.keys(json).reduce((memo: {[s: string]: Buffer}, k) => {
      memo[k] = Buffer.from(json[k])
      return memo
    }, {})
  }

  writeFileSync(dataFile, XyoBase.stringify({}), 'utf8')
  return {}
}

function persist(dataFile: string, data: {[s: string]: Buffer}) {
  const transform = Object.keys(data).reduce((memo: {[s: string]: string}, key) => {
    memo[key] = data[key].toString()
    return memo
  }, {})

  writeFileSync(dataFile, XyoBase.stringify(transform), 'utf8')
}
