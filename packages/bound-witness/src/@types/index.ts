/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:13:28 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 8th March 2019 12:06:03 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSignature, IXyoPublicKey } from '@xyo-network/signing'
import { IXyoSerializableObject, XyoSerializationService } from '@xyo-network/serialization'
import { IXyoHash } from '@xyo-network/hashing'

/**
 * A payload encapsulates the meta data being shared between parties
 * in a bound witness.
 *
 * It is broken up between signed and unsigned portions
 */
export interface IXyoPayload {
  readonly heuristics: IXyoSerializableObject[]
  readonly metadata: IXyoSerializableObject[]
}

export interface IXyoKeySet extends IXyoSerializableObject {
  readonly keys: IXyoPublicKey[]
}

export interface IXyoSignatureSet extends IXyoSerializableObject {
  readonly signatures: IXyoSignature[]
}

export interface IXyoFetter extends IXyoSerializableObject {
  readonly keySet: IXyoKeySet
  readonly heuristics: IXyoSerializableObject[]
}

export interface IXyoFetterSet extends IXyoSerializableObject {
  readonly fetters: IXyoFetter[]
}

export interface IXyoWitness extends IXyoSerializableObject {
  readonly signatureSet: IXyoSignatureSet
  readonly metadata: IXyoSerializableObject[]
}
export interface IXyoWitnessSet extends IXyoSerializableObject {
  readonly witnesses: IXyoWitness[]
}

export type FetterOrWitness = IXyoFetter | IXyoWitness

export interface IXyoBoundWitnessFragment extends IXyoSerializableObject {
  fetterWitnesses: FetterOrWitness[]
}

export interface IXyoPayloadDataExtractionService {
  getIndex(payload: IXyoPayload): number | undefined
  getPreviousHash(payload: IXyoPayload): IXyoHash | undefined
  getNextPublicKey(payload: IXyoPayload): IXyoPublicKey | undefined
  getBridgeHashSet(payload: IXyoPayload): IXyoHash[] | undefined
  getBridgeBlockSet(payload: IXyoPayload): IXyoBoundWitness[] | undefined

  findElementInSignedPayload<T extends IXyoSerializableObject>(
    payload: IXyoPayload,
    schemaObjectId: number
  ): T | undefined

  findElementInUnsignedPayload<T extends IXyoSerializableObject>(
    payload: IXyoPayload,
    schemaObjectId: number
  ): T | undefined
}

export interface IXyoBoundWitnessParty {
  partyIndex: number
  keySet: IXyoKeySet
  signatureSet: IXyoSignatureSet
  heuristics: IXyoSerializableObject[]
  metadata: IXyoSerializableObject[]
  getHeuristic<T extends IXyoSerializableObject>(schemaObjectId: number): T | undefined
  getMetaDataItem<T extends IXyoSerializableObject>(schemaObjectId: number): T | undefined
}

export interface IXyoBoundWitness extends IXyoSerializableObject, IXyoBoundWitnessFragment {
  readonly publicKeys: IXyoKeySet[]
  readonly signatures: IXyoSignatureSet[]
  readonly heuristics: IXyoSerializableObject[][]
  readonly metadata: IXyoSerializableObject[][]

  readonly numberOfParties: number
  readonly parties: IXyoBoundWitnessParty[]

  getSigningData(): Buffer
  getHeuristicFromParty<T extends IXyoSerializableObject>(partyIndex: number, schemaObjectId: number): T | undefined
  getMetaDataItemFromParty<T extends IXyoSerializableObject>(partyIndex: number, schemaObjectId: number): T | undefined
  stripMetaData(): IXyoBoundWitness
}
