/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 2:11:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: blockList.ts
 
 * @Last modified time: Tuesday, 19th February 2019 10:55:05 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { GraphQLResolveInfo } from "graphql"
import { IXyoHashProvider } from '@xyo-network/hashing'
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"

export const serviceDependencies = [`originBlockRepository`, `hashProvider`]

export default class XyoGetBlockList implements IXyoDataResolver<any, any, any, any> {

  public static query = `blockList(limit: Int!, cursor: String): XyoBlockList!`
  public static dependsOnTypes = [`XyoBlockList`]

  constructor (
    private readonly originBlockRepository: IXyoOriginBlockRepository,
    protected readonly hashProvider: IXyoHashProvider
  ) {}

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const cursor = args.cursor as string | undefined
    const cursorBuffer = cursor ? Buffer.from(cursor, 'hex') : undefined
    const result = await this.originBlockRepository.getOriginBlocks(args.limit as number, cursorBuffer)

    let endCursor: string | undefined
    if (result.list.length) {
      endCursor = (await this.hashProvider
          .createHash(
            result.list[result.list.length - 1].getSigningData())
          ).serializeHex()
    }

    return {
      meta: {
        endCursor,
        totalCount: result.totalSize,
        hasNextPage: result.hasNextPage,
      },
      items: await Promise.all(result.list.map(async (block) => {
        return {
          humanReadable: block.getReadableValue(),
          bytes: block.serializeHex(),
          publicKeys: block.publicKeys.map((keyset) => {
            return {
              array: keyset.keys.map((key) => {
                return {
                  value: key.serializeHex()
                }
              })
            }
          }),
          signatures: block.signatures.map((sigSet) => {
            return {
              array: sigSet.signatures.map((sig) => {
                return {
                  value: sig.serializeHex()
                }
              })
            }
          }),
          heuristics: block.heuristics.map((heuristicSet) => {
            return {
              array: heuristicSet.map((heuristic) => {
                return {
                  value: heuristic.serializeHex()
                }
              })
            }
          }),
          signedHash: (await this.hashProvider.createHash(block.getSigningData())).serializeHex()
        }
      }))
    }
  }
}
