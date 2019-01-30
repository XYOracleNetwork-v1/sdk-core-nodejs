/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 15th October 2018 4:43:21 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th December 2018 11:44:27 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoGraphQLServer } from "@xyo-network/graphql-server"
import { GraphqlSchemaBuilder } from "./graphql-schema-builder"
import { IXyoArchivistRepository } from "@xyo-network/archivist-repository"
import { IXyoHashProvider } from '@xyo-network/hashing'
import { XyoAboutMeService } from '@xyo-network/about-me'
import { XyoAboutMeResolver } from "./resolvers/xyo-about-me-resolver"
import { XyoGetBlockByHashResolver } from "./resolvers/xyo-get-block-by-hash-resolver"
import { GetEntitiesResolver } from "./resolvers/xyo-get-entities-resolver"
import { XyoGetBlockList } from "./resolvers/xyo-get-block-list-resolver"
import { XyoGetBlocksByPublicKeyResolver } from "./resolvers/xyo-get-blocks-by-public-key-resolver"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { XyoGetIntersectionsResolver } from "./resolvers/xyo-get-intersections-resolver"

/**
 * Initializes and starts a GraphQL Server
 *
 * @export
 * @param {number} port The port the service will be available on
 * @param {XyoAboutMeService} aboutMeService Provides information about the Node using this service
 * @param {XyoArchivistRepository} archivistRepository An implementation of an `XyoArchivistRepository`
 * @param {IXyoHashProvider} hashProvider Provides hashing services
 * @param {IXyoSerializationService} serializationService Provides serialization services
 */

export default async function createGraphqlServer(
  port: number,
  aboutMeService: XyoAboutMeService,
  archivistRepository: IXyoArchivistRepository,
  hashProvider: IXyoHashProvider,
  serializationService: IXyoSerializationService
) {

  const server = new XyoGraphQLServer(await new GraphqlSchemaBuilder().buildSchema(), port)
  server.addQueryResolver('about', new XyoAboutMeResolver(aboutMeService))
  server.addQueryResolver('blockByHash', new XyoGetBlockByHashResolver(archivistRepository, hashProvider))
  server.addQueryResolver('entities', new GetEntitiesResolver(archivistRepository))
  server.addQueryResolver('blockList', new XyoGetBlockList(archivistRepository, hashProvider))
  server.addQueryResolver('blocksByPublicKey', new XyoGetBlocksByPublicKeyResolver(archivistRepository,
    hashProvider,
    serializationService
  ))
  server.addQueryResolver('intersections', new XyoGetIntersectionsResolver(archivistRepository))
  return server
}
