/*
 * File: index.ts
 * Project: @xyo-network/base-node
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 9:57:51 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

/*
 * File: index.ts
 * Project: @xyo-network/base-node
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 9:57:48 am
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
