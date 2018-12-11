/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 1:47:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-party.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 10th December 2018 1:52:42 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitnessParty, IXyoFetter, IXyoWitness, IXyoKeySet, IXyoSignatureSet } from './@types'
import { XyoBase } from '@xyo-network/base'
import { IXyoSerializableObject } from '@xyo-network/serialization'

export class XyoBoundWitnessParty extends XyoBase implements IXyoBoundWitnessParty {

  constructor(
    public readonly fetter: IXyoFetter,
    public readonly witness: IXyoWitness,
    public readonly partyIndex: number
  ) {
    super()
  }

  public get keySet(): IXyoKeySet {
    return this.getOrCreate('keySet', () => {
      return this.fetter.keySet
    })
  }

  public get signatureSet(): IXyoSignatureSet {
    return this.getOrCreate('signatureSet', () => {
      return this.witness.signatureSet
    })
  }

  public get heuristics(): IXyoSerializableObject[] {
    return this.getOrCreate('heuristics', () => {
      return this.fetter.heuristics
    })
  }

  public get metadata(): IXyoSerializableObject[] {
    return this.getOrCreate('metadata', () => {
      return this.witness.metadata
    })
  }

}
