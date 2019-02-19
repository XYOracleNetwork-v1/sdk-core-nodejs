/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 14th February 2019 2:57:04 pm
 * @Email:  developer@xyfindables.com
 * @Filename: intersections.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 14th February 2019 2:58:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { IXyoArchivistRepository } from "@xyo-network/archivist-repository"
import { GraphQLResolveInfo } from "graphql"

export const serviceDependencies = [`archivistRepository`]

export default class XyoGetIntersectionsResolver implements IXyoDataResolver<any, any, any, any> {

  // tslint:disable-next-line:max-line-length
  public static query = `intersections(publicKeyA: String!, publicKeyB: String!, limit: Int!, cursor: String): XyoIntersectionList!`
  public static dependsOnTypes = [`XyoIntersectionList`]

  constructor (private readonly archivistRepository: IXyoArchivistRepository) {}

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
