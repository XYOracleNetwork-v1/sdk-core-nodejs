/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { XyoBoundWitness } from '../bound-witness'
import { XyoIterableStructure, XyoStructure, XyoBuffer } from '../object-model'
import { XyoObjectSchema } from '../schema'

export interface IXyoHeuristicResolver {
  resolve(heuristic: Buffer): IXyoHumanHeuristic
}

export interface IXyoHumanHeuristic {
  name: string
  value: any
}

export class XyoHumanHeuristicResolver {
  public static addResolver(forId: number, resolver: IXyoHeuristicResolver) {
    XyoHumanHeuristicResolver.resolvers.set(forId, resolver)
  }

  public static removeResolver(forId: number) {
    XyoHumanHeuristicResolver.resolvers.delete(forId)
  }

  public static resolve(any: Buffer): IXyoHumanHeuristic {
    const item = new XyoStructure(new XyoBuffer(any))

    const resolver = XyoHumanHeuristicResolver.resolvers.get(
      item.getSchema().id
    )

    if (resolver) {
      return resolver.resolve(item.getAll().getContentsCopy())
    }

    return {
      name: item.getSchema().id.toString(),
      value: any.toString('base64')
    }
  }

  private static resolvers: Map<number, IXyoHeuristicResolver> = new Map()
}
