/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 12th December 2018 5:22:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-get-block-list-resolver.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 28th January 2019 1:01:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { GraphQLResolveInfo } from "graphql"
import { IXyoHashProvider } from '@xyo-network/hashing'
import { IXyoArchivistRepository } from "@xyo-network/archivist-repository"

export class XyoGetBlockList implements IXyoDataResolver<any, any, any, any> {

  constructor (
    private readonly archivistRepository: IXyoArchivistRepository,
    protected readonly hashProvider: IXyoHashProvider
  ) {
  }

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const cursor = args.cursor as string | undefined
    const cursorBuffer = cursor ? Buffer.from(cursor, 'hex') : undefined
    const result = await this.archivistRepository.getOriginBlocks(args.limit as number, cursorBuffer)

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
