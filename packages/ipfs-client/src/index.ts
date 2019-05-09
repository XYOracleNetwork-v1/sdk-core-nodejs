/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th December 2018 12:04:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 12th March 2019 12:44:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable-next-line:no-reference
/// <reference path="./@types/ipfs-http-client.d.ts" />
import {
  default as ipfsClient,
  IIpfsInitializationOptions,
  IIpfsClient,
} from 'ipfs-http-client'
import { XyoError } from '@xyo-network/errors'

import { XyoBase } from '@xyo-network/base'
import { base58 } from '@xyo-network/utils'
import {
  IXyoContentAddressableService,
  IContentAddress,
  contentAddressableToString,
} from '@xyo-network/content-addressable-service'
import { IXyoSerializableObject } from '@xyo-network/serialization'

export type XyoIpfsClientCtorOptions = IIpfsInitializationOptions

export interface IXyoIpfsClient extends IXyoContentAddressableService {
  readFile(address: string): Promise<Buffer | undefined>
}

export class XyoIpfsClient extends XyoBase implements IXyoIpfsClient {
  private ipfs: IIpfsClient
  constructor(
    private readonly ipfsInitializationOptions: XyoIpfsClientCtorOptions,
  ) {
    super()
    this.ipfs = ipfsClient(this.ipfsInitializationOptions)
  }

  public async readFile(address: string): Promise<Buffer | undefined> {
    let cancel = () => {}
    let request: any
    const getRequest = (r: any) => {
      request = r
    }
    let isTimedOut = false
    const timeout = new Promise((resolve, reject) => {
      cancel = XyoBase.timeout(() => {
        isTimedOut = true
        request.abort() // this will hang up socket and cause reject
      }, 30000)
    })
    const fetcher = new Promise(async (resolve, reject) => {
      const cb = (err: any, files: any) => {
        if (err) {
          reject(err)
        } else {
          if (!files || files.length !== 1) {
            this.logError(`Bad ipfs hash ${address}`)
            reject('Bad Ipfs hash')
          } else {
            resolve(files[0].content)
          }
        }
      }
      this.ipfs.get(address, undefined, cb, getRequest)
    })
    return new Promise(async (resolve, reject) => {
      await Promise.race([timeout, fetcher]).then((value) => {
        if (!isTimedOut) {
          cancel()
          cancel = () => { }
        }
        resolve(value as Buffer)
      }).catch((err) => {
        if (!isTimedOut) {
          cancel()
          cancel = () => { }
        }
        this.logError(
          `There was an error getting ipfs address ${address}`,
          err
        )
        reject(err)
      })
    })

  }

  public async get(key: IContentAddress): Promise<Buffer | undefined> {
    const strKey = contentAddressableToString(key)
    const rawData = await this.readFile(strKey)
    return rawData
  }

  public async add(value: Buffer | IXyoSerializableObject): Promise<string> {
    const v = value instanceof Buffer ? value : value.serialize()
    return new Promise((resolve, reject) => {
      this.ipfs.add(v, { pin: true }, (err, resultItems) => {
        if (err) return reject(err)
        console.log('IPFS Result Items', err, resultItems, v)
        if (resultItems.length !== 1) {
          reject(
            new XyoError(
              `There was an error adding data to ipfs, resultItems length: ${
                resultItems.length
              }`,
            ),
          )
        }

        return resolve(resultItems[0].hash)
      })
    })
  }
}
