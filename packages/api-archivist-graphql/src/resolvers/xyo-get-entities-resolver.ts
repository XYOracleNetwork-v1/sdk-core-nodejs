/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 12th December 2018 4:46:05 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-get-entities-resolver.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th December 2018 11:47:29 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { IXyoArchivistRepository } from "@xyo-network/archivist-repository"
import { GraphQLResolveInfo } from "graphql"

export class GetEntitiesResolver implements IXyoDataResolver<any, any, any, any> {

  constructor (private readonly archivistRepository: IXyoArchivistRepository) {}

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const result = await this.archivistRepository.getEntities(
      args.limit as number,
      args.cursor || undefined
    )

    return {
      meta: {
        totalCount: result.totalSize,
        hasNextPage: result.hasNextPage,
        endCursor: result.cursor ? result.cursor : undefined
      },
      items: result.list.map((listItem) => {
        return {
          firstKnownPublicKey: listItem.firstKnownPublicKey.serializeHex(),
          allPublicKeys: (listItem.allPublicKeys || []).map(pk => pk.serializeHex()),
          type: listItem.type,
          mostRecentIndex: listItem.mostRecentIndex
        }
      })
    }
  }
}
