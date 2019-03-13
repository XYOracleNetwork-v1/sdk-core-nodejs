/*
* @Author: XY | The Findables Company <ryanxyo>
* @Date:   Friday, 8th March 2019 3:42:13 pm
* @Email:  developer@xyfindables.com
* @Filename: xyo-transaction-repository.ts
* @Last modified by: ryanxyo
* @Last modified time: Friday, 8th March 2019 3:42:43 pm
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/

import { XyoBase } from "@xyo-network/base"
import { IXyoTransactionRepository, IXyoTransaction, IXyoTransactionMeta } from "./@types"
import { IRepoItem } from "@xyo-network/utils"

export class XyoTransactionRepository extends XyoBase implements IXyoTransactionRepository {
  public data: ITransactionData

  constructor (data?: ITransactionData) {
    super()
    this.data = data || {
      data: {}
    }
  }

  public async add(id: string, item: IXyoTransaction <any>): Promise < void > {
    const transactionBuffer = Buffer.from(JSON.stringify(item))

    this.data.data[id] = transactionBuffer
  }
  public async contains(id: string): Promise < boolean > {
    try {
      return Boolean(this.data.data[id])
    } catch (e) { // swallow
      return false
    }
  }

  public async find(id: string) {
    try {
      const buffer = await this.data.data[id]
      if (!buffer) return undefined
      return JSON.parse(buffer.toString()) as IXyoTransaction<any>
    } catch (e) { // swallow
      return undefined
    }
  }

  public async list(limit: number, cursor: string | undefined) {
    const keySpace = Object.keys(this.data.data)
    const totalCount = keySpace.length

    const startingIndex = cursor ? keySpace.indexOf(cursor) : 0
    const endingIndex = startingIndex + limit

    // tslint:disable-next-line:array-type
    const transactions: IXyoTransaction<any>[] = []
    let endCursor: string | undefined
    for (let i = startingIndex; i <= endingIndex && i < keySpace.length; i += 1) {
      const keyPair = this.data.data[keySpace[i]]
      endCursor = keyPair.toString('hex')
      transactions.push(JSON.parse(keyPair.toString()) as IXyoTransaction<any>)
    }

    return {
      meta: {
        endCursor,
        totalCount,
        hasNextPage: keySpace.length > endingIndex
      },
      items: transactions
    }
  }
}
export interface ITransactionData {
  data: {
    [id: string]: Buffer // JSON string representation of transaction and meta
  }
}
