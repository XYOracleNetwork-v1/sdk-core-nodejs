import { XyoStructure } from '../object-model'

export interface IXyoHeuristicGetter {
  getHeuristic(choice?: Buffer): XyoStructure | undefined
}
