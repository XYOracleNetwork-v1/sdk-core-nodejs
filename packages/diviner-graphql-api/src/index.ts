/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th December 2018 12:37:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st December 2018 11:35:39 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoGraphQLServer } from '@xyo-network/graphql-server'
import { importSchema } from 'graphql-import'
import { IXyoAboutDiviner } from '@xyo-network/about-diviner'
import { IXyoMetaList } from '@xyo-network/meta-list'
import { IXyoAnswerProvider, IXyoHasIntersectedQuestion } from '@xyo-network/questions'

import path from 'path'

export default async function createGraphqlServer(
  port: number,
  aboutDivinerDataProvider: () => Promise<IXyoAboutDiviner>,
  archivistsProvider: () => Promise<IXyoMetaList<string>>,
  haveIntersectedAnswerProvider: IXyoAnswerProvider<IXyoHasIntersectedQuestion, any>
) {
  const schemaPath = path.join(__dirname, '..', 'graphql', 'root.graphql')
  const typeDefs = importSchema(schemaPath)
  const server = new XyoGraphQLServer(typeDefs, port)

  server.addQueryResolver('about', {
    resolve: async () => {
      return aboutDivinerDataProvider()
    }
  })

  server.addQueryResolver('archivists', {
    resolve: async () => {
      const archivists = await archivistsProvider()
      return archivists
    }
  })

  server.addQueryResolver('questionHasIntersected', {
    resolve(obj: any, args: any, context: any, info: any): Promise<boolean> {
      return haveIntersectedAnswerProvider.resolve({
        partyOne: args.partyOneAddresses as string[],
        partyTwo: args.partyTwoAddresses as string[],
        markers: args.markers as string[],
        direction: args.direction as 'FORWARD' | 'BACKWARD'
      })
    }
  })

  return server
}
