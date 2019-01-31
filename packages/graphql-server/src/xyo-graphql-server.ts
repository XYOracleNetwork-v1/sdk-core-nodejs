/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th December 2018 11:17:53 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-graphql-server.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 30th January 2019 2:30:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { ApolloServer, gql, IResolvers } from 'apollo-server'
import { XyoBase } from '@xyo-network/base'
import { IXyoDataResolver } from './@types'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import GraphQLJSON from 'graphql-type-json'

export class XyoGraphQLServer extends XyoBase {
  public server: ApolloServer | undefined
  private readonly graphqlResolvers: IGraphQLResolvers = {}

  constructor(private readonly schema: string, private readonly port: number) {
    super()
  }

  public addQueryResolver<TSource, TArgs, TContext, TResult>(
    route: string,
    resolver: IXyoDataResolver<TSource, TArgs, TContext, TResult>
  ) {
    if (this.graphqlResolvers[route]) {
      throw new XyoError(`Route ${route} already exists. Will not add`, XyoErrors.CRITICAL)
    }

    this.graphqlResolvers[route] = resolver
  }

  public async start (): Promise<void> {
    this.logInfo(`Starting Graphql server`)
    const { typeDefs, resolvers } = this.initialize()
    this.server = new ApolloServer({ typeDefs, resolvers })

    const { url } = await this.server.listen({ port: this.port })
    this.logInfo(`Graphql server ready at url: ${url}`)
  }

  public async stop (): Promise<void> {
    this.logInfo(`Stopping Graphql server`)
    if (this.server) {
      await this.server.stop()
    }
    this.logInfo(`Stopped Graphql server`)
  }

  private initialize () {
    // Build Router
    const compiledRouter = Object.keys(this.graphqlResolvers as object).reduce((router, route) => {
      // @ts-ignore
      router[route] = (obj: any, args: any, context: any, info: any) => {
        // @ts-ignore
        return (this.graphqlResolvers[route] as IXyoDataResolver).resolve(obj, args, context, info)
      }
      return router
    }, {})

    const resolvers: IResolvers = {
      JSON: GraphQLJSON,
      Query: compiledRouter
    }

    const typeDefs = gql(this.schema)
    return { typeDefs, resolvers }
  }
}

export interface IGraphQLResolvers {
  [s: string]: IXyoDataResolver<any, any, any, any>
}
