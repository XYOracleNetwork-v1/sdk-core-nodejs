import { defaultsDeep } from 'lodash'
import networkResolvers from './network/resolvers'
import configurationResolvers from './configuration/resolvers'

export default defaultsDeep(
  {
    Query: {},
    Mutation: {}
  },
  configurationResolvers(),
  networkResolvers(),
)
