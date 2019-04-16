/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Tuesday, 19th February 2019 10:54:17 am
 * @Email:  developer@xyfindables.com
 * @Filename: transactionList.ts
 
 * @Last modified time: Monday, 11th March 2019 3:51:22 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { GraphQLResolveInfo } from "graphql"
import { IXyoTransactionRepository } from "@xyo-network/transaction-pool"

export const serviceDependencies = [`transactionRepository`]

export default class XyoGetBlockList implements IXyoDataResolver<any, any, any, any> {

  public static query = `transactionList(limit: Int!, cursor: String): XyoTransactionList!`
  public static dependsOnTypes = [`XyoTransactionList`]

  constructor (private readonly transactionRepository: IXyoTransactionRepository) {}

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const cursor = args.cursor as string | undefined
    const limit = args.limit as number
    return this.transactionRepository.list(limit, cursor)
  }
}
