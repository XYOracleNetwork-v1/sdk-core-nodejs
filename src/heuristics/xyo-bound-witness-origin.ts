/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/interface-name-prefix */
import { XyoBoundWitness } from '../bound-witness'
import { indexResolver } from './common'
import { XyoObjectSchema } from '../schema'
import { XyoIterableStructure, XyoStructure } from '../object-model'

export interface IXyoBoundWitnessOrigin {
  previousHash: Buffer | undefined
  index: number
  nextPublicKey: Buffer | undefined
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

        nextPublicKey = nextPublicKeyArray
          .get(0)
          .getAll()
          .getContentsCopy()
      }

      if (heuristic.getSchema().id === XyoObjectSchema.PREVIOUS_HASH.id) {
        const previousHashArray = heuristic as XyoIterableStructure

        if (previousHashArray.getCount() !== 1) {
          throw new Error('1 hash expected in previous hash')
        }

        previousHash = previousHashArray
          .get(0)
          .getAll()
          .getContentsCopy()
      }

      if (heuristic.getSchema().id === XyoObjectSchema.INDEX.id) {
        index = indexResolver.resolve(heuristic.getAll().getContentsCopy())
          .value
      }
    }

    return {
      previousHash,
      index,
      nextPublicKey
    }
  }
}
