/*
 * File: index.ts
 * Project: @xyo-network/base-node
 * File Created: Wednesday, 17th April 2019 9:10:14 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 1:30:53 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

export {
  IXyoAboutMeConfig,
  IXyoBoundWitnessConfig,
  IXyoDataConfig,
  IXyoDiscoveryConfig,
  IXyoGraphQLConfig,
  IXyoNetworkConfig,
  IXyoNetworkProcedureCatalogueConfig,
  IXyoNodeConfig,
  IXyoNodeNetworkConfig,
  IXyoNodeOptions,
  IXyoOriginChainConfig,
  IXyoPeerTransportConfig,
  IXyoResolvers,
  IXyoTCPBoundWitnessConfig,
  IXyoWeb3ServiceConfig,
  PartialNodeOptions
} from './@types'

export { resolvers } from './resolvers'
export { IResolvers } from './xyo-resolvers-enum'
export { XyoNode } from './xyo-node'
export { DEFAULT_NODE_OPTIONS } from './default-node-options'
