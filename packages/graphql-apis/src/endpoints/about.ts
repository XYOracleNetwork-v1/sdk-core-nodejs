/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 14th February 2019 9:35:22 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-about-me-endpoint.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 14th February 2019 1:54:13 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { XyoAboutMeService } from "@xyo-network/about-me"
import { GraphQLResolveInfo } from "graphql"

export const serviceDependencies = [`aboutMeService`]

export default class XyoAboutMeResolver implements IXyoDataResolver<any, any, any, any> {

  public static query = `about: XyoAboutMe`
  public static dependsOnTypes = [`XyoAboutMe`]

  constructor (private readonly aboutMeService: XyoAboutMeService) {}

  public resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    return this.aboutMeService.getAboutMe()
  }
}
