/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th December 2018 12:56:56 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-get-intersections-resolver.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th December 2018 11:47:33 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { IXyoArchivistRepository } from "@xyo-network/archivist-repository"
import { GraphQLResolveInfo } from "graphql"

export class XyoGetIntersectionsResolver implements IXyoDataResolver<any, any, any, any> {

  constructor (
    private readonly archivistRepository: IXyoArchivistRepository
  ) {}

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const result = await this.archivistRepository.getIntersections(
      args.publicKeyA as string,
      args.publicKeyB as string,
      args.limit as number,
      args.cursor as string | undefined
    )

    return {
      meta: {
        totalCount: result.totalSize,
        hasNextPage: result.hasNextPage,
        endCursor: result.cursor ? result.cursor : undefined
      },
      items: result.list
    }
  }
}
