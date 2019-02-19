/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 19th February 2019 10:54:17 am
 * @Email:  developer@xyfindables.com
 * @Filename: transactionList.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 19th February 2019 11:52:56 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { GraphQLResolveInfo } from "graphql"
import { IXyoRepository } from "@xyo-network/utils"
import { IXyoTransaction } from "@xyo-network/transaction-pool"
import { IXyoHash, XyoHash, IXyoHashProvider } from "@xyo-network/hashing"

export const serviceDependencies = [`transactionRepository`, `hashProvider`]

export default class XyoGetBlockList implements IXyoDataResolver<any, any, any, any> {

  public static query = `transactionList(limit: Int!, cursor: String): XyoTransactionList!`
  public static dependsOnTypes = [`XyoTransactionList`]

  constructor (
    private readonly transactionRepository: IXyoRepository<IXyoHash, IXyoTransaction<any>>,
    private readonly hashProvider: IXyoHashProvider,
  ) {
  }

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const now = new Date().toISOString()
    const h = await this.hashProvider.createHash(Buffer.from(new Date().toISOString()))

    await this.transactionRepository.add(h, {
      transactionType: 'question-answer',
      data: {
        question: {
          now
        }
      }
    })

    const cursor = args.cursor as string | undefined
    const limit = args.limit as number
    return this.transactionRepository.list(limit, cursor)
  }
}
