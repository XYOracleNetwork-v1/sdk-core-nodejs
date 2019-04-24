import { XyoBoundWitness } from '../bound-witness'
import { XyoIterableStructure } from '@xyo-network/object-model'
import { XyoObjectSchema } from '../schema'

export interface IXyoHeuristicResolver {
  resolve (heuristic: Buffer): IXyoHumanHeuristic
}

export interface IXyoHumanHeuristic {
  name: string,
  value: any
}

export class XyoHumanHeuristicResolver {

  public static addResolver (forId: number, resolver: IXyoHeuristicResolver) {
    XyoHumanHeuristicResolver.resolvers.set(forId, resolver)
  }

  public static removeResolver (forId: number) {
    XyoHumanHeuristicResolver.resolvers.delete(forId)
  }

  public static resolve (boundWitness: XyoIterableStructure): IXyoHumanHeuristic[][] {
    const bwIt = boundWitness.newIterator()
    const partyHeuristics: IXyoHumanHeuristic[][] = []

    while (bwIt.hasNext()) {
      const bwItem = bwIt.next().value

      if (bwItem instanceof XyoIterableStructure && bwItem.getSchema().id === XyoObjectSchema.FETTER.id) {
        const bwItemIt = bwItem.newIterator()
        const heuristics: IXyoHumanHeuristic[] = []

        while (bwItemIt.hasNext()) {
          const item =  bwItemIt.next().value
          try {

            const resolver = XyoHumanHeuristicResolver.resolvers.get(item.getSchema().id)

            if (resolver) {
              heuristics.push(resolver.resolve(item.getAll().getContentsCopy()))
            }
          } catch (error) {
            // a byte error as happened, so do not add the IXyoHumanHeuristic
          }
        }

        partyHeuristics.push(heuristics)
      }
    }

    return partyHeuristics
  }

  private static resolvers: Map<number, IXyoHeuristicResolver>

}
