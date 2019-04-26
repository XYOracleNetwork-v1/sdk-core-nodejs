import { XyoBoundWitness } from '../bound-witness'
import { XyoIterableStructure, XyoStructure, XyoBuffer } from '@xyo-network/object-model'
import { XyoObjectSchema } from '../schema'

export interface IXyoHeuristicResolver {
  resolve(heuristic: Buffer): IXyoHumanHeuristic
}

export interface IXyoHumanHeuristic {
  name: string,
  value: any
}

export class XyoHumanHeuristicResolver {

  public static addResolver(forId: number, resolver: IXyoHeuristicResolver) {
    XyoHumanHeuristicResolver.resolvers.set(forId, resolver)
  }

  public static removeResolver(forId: number) {
    XyoHumanHeuristicResolver.resolvers.delete(forId)
  }

  public static resolve(any: Buffer): any {
    const item = new XyoStructure(new XyoBuffer(any))

    if (item.getSchema().getIsIterable()) {
      const children: any[] = []
      const iterableItem = new XyoIterableStructure(new XyoBuffer(any)).newIterator()

      while (iterableItem.hasNext()) {
        const subItem = iterableItem.next().value
        children.push(XyoHumanHeuristicResolver.resolve(subItem.getAll().getContentsCopy()))
      }

      return children
    }

    const resolver = XyoHumanHeuristicResolver.resolvers.get(item.getSchema().id)

    if (resolver) {
      return resolver.resolve(item.getAll().getContentsCopy())
    }

    return {
      name: 'unknown',
      value: any.toString('base64')
    }
  }

  private static resolvers: Map<number, IXyoHeuristicResolver> = new Map()

}
