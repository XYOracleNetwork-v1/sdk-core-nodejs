import { IXyoBoundWitnessPayload } from '../heuristics'
import { IXyoHeuristicGetter } from '../heuristics/xyo-heuristic-getter'
import { XyoStructure } from '../object-model'
import { XyoOriginState } from './xyo-origin-state'
import XyoPayloadConstructor from './xyo-payload-constructor'

export class XyoOriginPayloadConstructor implements XyoPayloadConstructor {
  private originState: XyoOriginState
  private heuristicGetters: Map<string, IXyoHeuristicGetter> = new Map()

  constructor(originState: XyoOriginState) {
    this.originState = originState
  }

  public addHeuristicGetter(key: string, getter: IXyoHeuristicGetter) {
    this.heuristicGetters.set(key, getter)
  }

  public removeHeuristicGetter(key: string) {
    this.heuristicGetters.delete(key)
  }

  // eslint-disable-next-line require-await
  public async getPayloads(choice: Buffer): Promise<IXyoBoundWitnessPayload> {
    const originItems = this.getOriginItems()
    const getterItems = this.getAllHeuristics(choice)

    const payload: IXyoBoundWitnessPayload = {
      signed: originItems.concat(getterItems),
      unsigned: [],
    }

    return payload
  }

  private getAllHeuristics(choice: Buffer): XyoStructure[] {
    const toReturn: XyoStructure[] = []

    this.heuristicGetters.forEach((value, _) => {
      const item = value.getHeuristic(choice)

      if (item) {
        toReturn.push(item)
      }
    })

    return toReturn
  }

  private getOriginItems(): XyoStructure[] {
    const toReturn: XyoStructure[] = []

    const index = this.originState.getIndex()
    const previousHash = this.originState.getPreviousHash()
    const nextPublicKey = this.originState.getNextPublicKey()

    toReturn.push(index)

    if (previousHash) {
      toReturn.push(previousHash)
    }

    if (nextPublicKey) {
      toReturn.push(nextPublicKey)
    }

    return toReturn
  }
}
