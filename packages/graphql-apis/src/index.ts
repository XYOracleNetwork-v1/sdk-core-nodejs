/*
* @Author: XY | The Findables Company <ryanxyo>
* @Date:   Thursday, 14th February 2019 10:09:22 am
* @Email:  developer@xyfindables.com
* @Filename: index.ts
* @Last modified by: ryanxyo
* @Last modified time: Thursday, 14th February 2019 10:12:09 am
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/
// tslint:disable:new-parens

import { XyoGraphQLServer, IXyoDataResolver } from "@xyo-network/graphql-server"
import { IXyoProviderContainer } from "@xyo-network/utils"

export async function buildGraphQLServer(
  config: IXyoGraphQLAPIs,
  container: IXyoProviderContainer
): Promise<XyoGraphQLServer> {
  const { queries, types, resolvers } = await Object.keys(config.apis)
    .reduce(async (promiseChain: Promise<IQueryBuilder>, api) => {
      const memo = await promiseChain
      // @ts-ignore
      if (!config.apis[api]) return memo
      const { default: resolver, serviceDependencies } = (await import(`./endpoints/${api}`)) as IEndpointModule
      const deps = await Promise.all(serviceDependencies.map(serviceDependency => container.get(serviceDependency)))
      const instance = new (Function.prototype.bind.apply(resolver, [null, ...deps]))
      memo.resolvers[api] = instance
      memo.queries.push((resolver as IReflectionEndpoint).query)
      memo.types.push(...(resolver as IReflectionEndpoint).dependsOnTypes)
      return memo
    }, Promise.resolve({ queries: [], types: [], resolvers: {} })
  )

  const typesByName = await types.reduce(async (promiseChain: Promise<{[s: string]: string}>, type) => {
    const memo = await promiseChain
    await recursivelyResolveTypes(type, memo)
    return memo
  }, Promise.resolve({}))

  const schema = `
scalar JSON

type Query {
  ${queries.join('\n  ')}
}

${Object.values(typesByName).join('\n\n')}
`

  console.log(`schema \n\n${schema}`)

  const server = new XyoGraphQLServer(schema, config.port)
  Object.keys(resolvers).forEach((route) => {
    server.addQueryResolver(route, resolvers[route])
  })

  return server
}

async function recursivelyResolveTypes(type: string, accumulator: {[s: string]: string}): Promise<void> {
  const { dependsOnTypes, type: graphqlType } = await import(`./graphql-types/${type}`)
  accumulator[type] = graphqlType
  await Promise.all(dependsOnTypes.map((dep: string) => {
    if (!accumulator[dep]) {
      return recursivelyResolveTypes(dep, accumulator)
    }

    return Promise.resolve()
  }))

  return
}

export interface IXyoGraphQLAPIs {
  port: number,
  apis: {
    about?: boolean
    blockByHash?: boolean
    entities?: boolean
    blockList?: boolean
    blocksByPublicKey?: boolean
    intersections?: boolean
  }
}

interface IQueryBuilder {
  queries: string[],
  types: string[],
  resolvers: {[s: string]: IXyoDataResolver<any, any, any, any>}
}

interface IReflectionEndpoint {
  query: string
  dependsOnTypes: string[]
}

interface IEndpointModule {
  default: any & IReflectionEndpoint
  serviceDependencies: string[]
}
