import { XyoHumanHeuristicResolver } from '../xyo-heuristic-resolver'
import defaultResolvers from './defaultResolvers'
export * from './resolvers'

export const addAllDefaults = () => {
  XyoHumanHeuristicResolver.addResolvers(defaultResolvers)
}
