/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 2:25:39 pm
 * @Email:  developer@xyfindables.com
 * @Filename: entities.ts
 
 * @Last modified time: Thursday, 14th February 2019 2:26:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { IXyoArchivistRepository } from "@xyo-network/archivist-repository"
import { GraphQLResolveInfo } from "graphql"

export const serviceDependencies = [`archivistRepository`]

export default class GetEntitiesResolver implements IXyoDataResolver<any, any, any, any> {

  public static query = `entities(limit: Int!, cursor: String): XyoEntitiesList!`
  public static dependsOnTypes = [`XyoEntitiesList`]

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
