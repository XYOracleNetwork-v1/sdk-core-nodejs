/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 12th December 2018 12:37:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-about-me-resolver.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 14th February 2019 10:06:05 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { XyoAboutMeService } from "@xyo-network/about-me"
import { GraphQLResolveInfo } from "graphql"

export class XyoAboutMeResolver implements IXyoDataResolver<any, any, any, any> {
  constructor (private readonly aboutMeService: XyoAboutMeService) {}

  public resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    return this.aboutMeService.getAboutMe()
  }
}
