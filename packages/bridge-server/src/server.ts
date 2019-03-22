import express, { Express } from 'express'
import { IContext, IExpressApplyRoutes } from './@types'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import { typeDefs, resolvers } from './gql'
import { applyRoutes } from './express'

export class BridgeServer {
  public app: Express
  public config: ApolloServerExpressConfig
  public schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

  constructor (
    public context: IContext,
    public initializeRoutes: IExpressApplyRoutes = applyRoutes
  ) {
    this.app = express()
    this.config = {
      schema: this.schema,
      context: this.context
    }
  }

  public start (cb?: () => void) {
    const server = new ApolloServer(this.config)
    server.applyMiddleware({ app: this.app })
    this.initializeRoutes(this.app)
    this.app.listen({ port: this.context.port }, cb)
  }
}
