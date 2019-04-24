import { XyoStructure } from '@xyo-network/object-model'

export interface IXyoHeuristicGetter {
  getHeuristic (): XyoStructure | undefined
}
