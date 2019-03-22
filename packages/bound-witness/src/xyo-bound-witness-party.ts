/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 1:47:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-party.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 1:41:18 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitnessParty, IXyoFetter, IXyoWitness, IXyoKeySet, IXyoSignatureSet, IXyoBoundWitness } from './@types'
import { XyoBase } from '@xyo-network/base'
import { IXyoSerializableObject } from '@xyo-network/serialization'

export class XyoBoundWitnessParty extends XyoBase implements IXyoBoundWitnessParty {

  public get keySet(): IXyoKeySet {
    return this.fetter.keySet
  }

  public get signatureSet(): IXyoSignatureSet {
    return this.witness.signatureSet
  }

  public get heuristics(): IXyoSerializableObject[] {
    return this.fetter.heuristics
  }

  public get metadata(): IXyoSerializableObject[] {
    return this.witness.metadata
  }

  constructor(
    public readonly fetter: IXyoFetter,
    public readonly witness: IXyoWitness,
    public readonly partyIndex: number
  ) {
    super()
  }

  public getHeuristic<T extends IXyoSerializableObject>(schemaObjectId: number) {
    const items = this.heuristics.filter(h => h.schemaObjectId === schemaObjectId)
    return items.length > 0 ? items[0] as T : undefined
  }

  public getMetaDataItem<T extends IXyoSerializableObject>(schemaObjectId: number): T | undefined {
    const items = this.metadata.filter(m => m.schemaObjectId === schemaObjectId)
    return items.length > 0 ? items[0] as T : undefined
  }

}
