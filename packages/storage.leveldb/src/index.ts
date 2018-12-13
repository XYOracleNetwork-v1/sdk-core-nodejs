/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th December 2018 9:34:47 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 13th December 2018 9:40:00 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoIterableStorageProvider, IXyoStorageIterationResult, IXyoBufferKeyValuePair } from '@xyo-network/storage'
import levelup, { LevelUp } from 'levelup'
import leveldown, { LevelDown } from 'leveldown'

export class XyoLevelDbStorageProvider implements IXyoIterableStorageProvider {

  private db: LevelUp<LevelDown>

  constructor (levelDbDirectory: string) {
    this.db = levelup(leveldown(levelDbDirectory))
  }

  public async write(key: Buffer, value: Buffer): Promise<undefined> {
    return new Promise((resolve, reject) => {
      this.db.put(key, value, (err) => {
        if (err) {
          return reject(err)
        }

        return resolve()
      })
    }) as Promise<undefined>
  }

  public async read(key: Buffer): Promise<Buffer | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(key, (err, value) => {
        if (err) {
          return reject(err)
        }

        return resolve(value as Buffer)
      })
    }) as Promise<Buffer | undefined>
  }

  public async getAllKeys(): Promise<Buffer[]> {
    return new Promise((resolve, reject) => {
      const keys: Buffer[] = []
      this.db.createKeyStream()
        .on('data', (data) => {
          keys.push(data as Buffer)
        })
        .on('end', () => {
          return resolve(keys)
        })

    }) as Promise<Buffer[]>
  }

  public async delete(key: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.del(key, (err) => {
        if (err) {
          return reject(err)
        }

        return resolve(undefined)
      })
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
    }) as Promise<IXyoStorageIterationResult>
  }

}
