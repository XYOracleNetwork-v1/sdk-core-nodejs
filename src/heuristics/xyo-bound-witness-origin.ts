import { XyoBoundWitness } from '../bound-witness'
import { XyoIterableStructure, XyoStructure } from '../object-model'
import { XyoObjectSchema } from '../schema'
import { indexResolver } from './common'

export interface IXyoBoundWitnessOrigin {
  index: number
  nextPublicKey: Buffer | undefined
  previousHash: Buffer | undefined
}

export class XyoBoundWitnessOriginGetter {
  public static getOriginInformation(
    boundWitness: XyoBoundWitness
  ): IXyoBoundWitnessOrigin[] {
    const origins: IXyoBoundWitnessOrigin[] = []
    const allHeuristics = boundWitness.getHeuristics()

    for (const fetterHeuristics of allHeuristics) {
      origins.push(
        XyoBoundWitnessOriginGetter.getOriginInformationFromFetter(
          fetterHeuristics
        )
      )
    }

    return origins
  }

  private static getOriginInformationFromFetter(
    fetterHeuristics: XyoStructure[]
  ): IXyoBoundWitnessOrigin {
    let nextPublicKey: Buffer | undefined
    let previousHash: Buffer | undefined
    let index = -1

    for (const heuristic of fetterHeuristics) {
      if (heuristic.getSchema().id === XyoObjectSchema.NEXT_PUBLIC_KEY.id) {
        const nextPublicKeyArray = heuristic as XyoIterableStructure

        if (nextPublicKeyArray.getCount() !== 1) {
          throw new Error('1 next public key expected')
        }

        nextPublicKey = nextPublicKeyArray.get(0).getAll().getContentsCopy()
      }

      if (heuristic.getSchema().id === XyoObjectSchema.PREVIOUS_HASH.id) {
        const previousHashArray = heuristic as XyoIterableStructure

        if (previousHashArray.getCount() !== 1) {
          throw new Error('1 hash expected in previous hash')
        }

        previousHash = previousHashArray.get(0).getAll().getContentsCopy()
      }

      if (heuristic.getSchema().id === XyoObjectSchema.INDEX.id) {
        index = indexResolver.resolve(heuristic.getAll().getContentsCopy())
          .value
      }
    }

    return {
      index,
      nextPublicKey,
      previousHash,
    }
  }
}
