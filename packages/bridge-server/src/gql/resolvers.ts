import { defaultsDeep } from 'lodash'
import networkResolvers from './network/resolvers'

export default defaultsDeep(
  {
    Query: {},
    Mutation: {}
  },
  networkResolvers()
)
