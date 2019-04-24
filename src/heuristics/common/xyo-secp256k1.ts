import { IXyoHeuristicResolver, IXyoHumanHeuristic } from '../xyo-heuristic-resolver'

export const XyoSecp256K1Resolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'XyoSecp256K1 Public Key',
      value: heuristic.toString('hex')
    }
  }
}
