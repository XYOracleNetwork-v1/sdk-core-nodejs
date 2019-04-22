/*
* @Author: XY | The Findables Company <xyo-network>
* @Date:   Friday, 8th March 2019 3:42:13 pm
* @Email:  developer@xyfindables.com
* @Filename: xyo-transaction-repository.ts

* @Last modified time: Friday, 8th March 2019 3:42:43 pm
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/

import { XyoBase } from '@xyo-network/base'
import { IXyoStorageProvider } from '@xyo-network/storage'
import { IXyoTransactionRepository, IXyoTransaction } from './@types'

export class XyoTransactionRepository extends XyoBase implements IXyoTransactionRepository {

  constructor (private readonly storage: IXyoStorageProvider) {
    super()
  }

  public async add(id: string, item: IXyoTransaction <any>): Promise < void > {
    const transactionBuffer = Buffer.from(JSON.stringify(item))
    await this.storage.write(Buffer.from(id), transactionBuffer)
  }
  public async contains(id: string): Promise < boolean > {
    try {
      return this.storage.containsKey(Buffer.from(id))
    } catch (e) {
      return false
    }
  }

  public async find(id: string) {
    try {
      const buffer = await this.storage.read(Buffer.from(id))
      if (!buffer) return undefined
      return JSON.parse(buffer.toString()) as IXyoTransaction<any>
    } catch (e) { // swallow
      return undefined
    }
  }

  public async list(limit: number, cursor: string | undefined) {
    const keySpace = (await this.storage.getAllKeys()).map(k => k.toString())
    const totalCount = keySpace.length

    const startingIndex = cursor ? keySpace.indexOf(cursor) : 0
    const endingIndex = startingIndex + limit

    // tslint:disable-next-line:array-type
    const transactionPromises: Promise<Buffer | undefined>[] = []
    let endCursor: string | undefined

    for (let i = startingIndex; i <= endingIndex && i < keySpace.length; i += 1) {
      const bufKey = Buffer.from(keySpace[i])
      endCursor = bufKey.toString('hex')
      transactionPromises.push(this.storage.read(bufKey))
    }

    const ts = await Promise.all(transactionPromises)
    const hydratedTransactions = ts.map((t) => {
      if (!t) return undefined
      return JSON.parse(t.toString()) as IXyoTransaction<any>
    })
    .filter(t => t !== undefined)

    return {
      meta: {
        endCursor,
        totalCount,
        hasNextPage: keySpace.length > endingIndex
      },
      // tslint:disable-next-line:prefer-array-literal
      items: hydratedTransactions as Array<IXyoTransaction<any>>
    }
  }
}
