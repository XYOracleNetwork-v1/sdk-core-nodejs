import { XyoStructure } from '../object-model'

export interface IXyoHeuristicGetter {
  getHeuristic(): XyoStructure | undefined
}
