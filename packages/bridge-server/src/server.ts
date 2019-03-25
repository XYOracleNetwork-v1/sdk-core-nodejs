import express, { Express } from 'express'
import { IContext, IExpressApplyRoutes } from './@types'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import { typeDefs, resolvers } from './gql'
import { applyRoutes } from './express'
import { verify } from './token'
import { get } from 'lodash'

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
      context: this.initContext
    }
  }

  public start (cb?: () => void) {
    const server = new ApolloServer(this.config)
    server.applyMiddleware({ app: this.app })
    this.initializeRoutes(this.app)
    this.app.listen({ port: this.context.port }, cb)
  }

  public initContext = async (req: any): Promise<IContext> => {
    const token = get(req, 'req.headers.X-Auth-Token') || get(req, 'req.headers.x-auth-token')
    let authenticated = false
    let authError = ''
    try {
      const pin = token && verify(token) as string
      authenticated = pin ? await this.context.configuration.verifyPin(pin) : false
    } catch (e) {
      authError = e.message
    }
    return {
      ...this.context,
      authenticated,
      authError
    }
  }
}
