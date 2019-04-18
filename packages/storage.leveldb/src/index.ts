/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th December 2018 9:34:47 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 8th March 2019 3:54:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoIterableStorageProvider, IXyoStorageIterationResult, IXyoBufferKeyValuePair } from '@xyo-network/storage'
import levelup, { LevelUp } from 'levelup'
import leveldown, { LevelDown } from 'leveldown'

export class XyoLevelDbStorageProvider implements IXyoIterableStorageProvider {

  public static createStore(location: string) {
    return getLevelDbStore(location)
  }

  private levelDbDirectory: string
  private db: LevelUp<LevelDown>
  private syncWrite = false

  constructor (levelDbDirectory: string, syncWrite?: boolean) {
    if (syncWrite) {
      this.syncWrite = syncWrite
    }

    this.levelDbDirectory = levelDbDirectory
    this.db = levelup(leveldown(this.levelDbDirectory))
  }

  public async write(key: Buffer, value: Buffer): Promise<undefined> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.put(key, value, { sync: this.syncWrite }, (err) => {
          if (err) {
            return reject(err)
          }

          return resolve()
        })
      } else {
        return reject("no db")
      }

    }) as Promise<undefined>
  }

  public async read(key: Buffer): Promise<Buffer | undefined> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.get(key, (err, value) => {
          if (err) {
            return reject(err)
          }

          return resolve(value as Buffer)
        })
      } else {
        return reject("no db")
      }
    }) as Promise<Buffer | undefined>
  }

  public async getAllKeys(): Promise<Buffer[]> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        const keys: Buffer[] = []
        this.db.createKeyStream()
        .on('data', (data) => {
          keys.push(data as Buffer)
        })
        .on('end', () => {
          return resolve(keys)
        })
      } else {
        return reject("no db")
      }

    }) as Promise<Buffer[]>
  }

  public async delete(key: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.del(key, (err) => {
          if (err) {
            return reject(err)
          }

          return resolve(undefined)
        })
      } else {
        return reject("no db")
      }

    }) as Promise<void>
  }

  public async containsKey(key: Buffer): Promise<boolean> {
    try {
      const value = await this.read(key)
      return Boolean(value)
    } catch (err) {
      if (err.notFound) {
        return false
      }

      throw err
    }
  }

  public iterate(options: {offsetKey?: Buffer, limit?: number}): Promise<IXyoStorageIterationResult> {
    const readOptions: {[s: string]: any} = {}
    if (options && options.offsetKey) {
      readOptions.gt = options.offsetKey
    }

    if (options && options.limit) {
      readOptions.limit = options.limit + 1 // We add 1 so we can answer the question has next :-)
    }

    return new Promise((resolve, reject) => {
      const values: IXyoBufferKeyValuePair[] = []
      let promiseResolved = false

      if (this.db) {
        this.db.createReadStream(readOptions)
        .on('data', (data) => {
          values.push(data as IXyoBufferKeyValuePair)
        })
        .on('error', (err) => {
          if (!promiseResolved) {
            promiseResolved = true
            reject(err)
          }
        })
        .on('close', () => {
          if (!promiseResolved) {
            promiseResolved = true
            const hasMoreItems = options.limit ? values.length === options.limit + 1 : false
            if (hasMoreItems) {
              values.pop()
            }
            resolve({
              hasMoreItems,
              items: values
            })
          }
        })
        .on('end', () => {
          if (!promiseResolved) {
            promiseResolved = true
            const hasMoreItems = options.limit ? values.length === options.limit + 1 : false
            if (hasMoreItems) {
              values.pop()
            }
            resolve({
              hasMoreItems,
              items: values
            })
          }
        })
      } else {
        reject("no db")
      }
    }) as Promise<IXyoStorageIterationResult>
  }

}

const cache: { [s: string]: XyoLevelDbStorageProvider } = {}

async function getLevelDbStore(storeLocation: string) {
  const store = cache[storeLocation]
  if (store) {
    return store
  }

  const newStore = new XyoLevelDbStorageProvider(storeLocation)
  cache[storeLocation] = newStore
  return newStore
}
