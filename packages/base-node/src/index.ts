/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 15th February 2019 10:22:17 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 15th February 2019 10:36:44 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
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
export { main, XyoNode, DEFAULT_NODE_OPTIONS } from './xyo-node'
