/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:13:28 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 3:13:33 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSignature, IXyoPublicKey } from '@xyo-network/signing'
import { IXyoSerializableObject } from '@xyo-network/serialization'

/**
 * A payload encapsulates the meta data being shared between parties
 * in a bound witness.
 *
 * It is broken up between signed and unsigned portions
 */
export interface IXyoPayload extends IXyoSerializableObject {

  /**
   * The signed portion of the payload
   *
   * @type {IXyoSerializableObject[]}
   * @memberof IXyoPayload
   */
  readonly signedPayload: IXyoSerializableObject[]

  /**
   * The unsigned portion of the payload
   *
   * @type {IXyoSerializableObject[]}
   * @memberof IXyoPayload
   */
  readonly unsignedPayload: IXyoSerializableObject[]
}

/**
 * A bound-witness is the central data type used to communicate between nodes in the
 * XYO network. The structure provides a cryptographically secure way that ensures,
 * through public-key cryptography, that two nodes interacted and agreed upon a
 * particular payload
 *
 * This particular structure is forward looking in that it may accommodate a future
 * situation where more than two nodes interacted. As such, there exists a positional
 * coupling across the fields of the `IXyoBoundWitness`. That is, a party in the
 * bound-witness corresponds to a particular index of the fields
 *
 * - publicKeys
 * - signatures
 * - payloads
 *
 * @export
 * @interface IXyoBoundWitness
 */
export interface IXyoBoundWitness extends IXyoSerializableObject {

  /**
   * A collection of publicKey collections associated with the
   * bound-witness. The outer-index represents the party. The inner-index
   * corresponds to a public-key entry. Parties are allowed to sign with
   * multiple key-pairs. The 2-dimensional index of each element corresponds
   * directly to the 2-dimensional index of the corresponding signature
   *
   * @type {IXyoPublicKey[][]}
   * @memberof IXyoBoundWitness
   */
  readonly publicKeys: IXyoPublicKey[][]

  /**
   * A collection of signatures collections associated with the
   * bound-witness. The outer-index represents the party. The inner-index
   * corresponds to a signature entry. Parties are allowed to sign with
   * multiple key-pairs. The 2-dimensional index of each element corresponds
   * directly to the 2-dimensional index of the corresponding publicKey
   *
   * @type {IXyoPublicKey[][]}
   * @memberof IXyoBoundWitness
   */
  readonly signatures: IXyoSignature[][]

  /**
   * Each party in a bound-witness contributes a payload. The index of
   * the payload corresponds to the party-member.
   *
   * @type {IXyoPayload[]}
   * @memberof IXyoBoundWitness
   */
  readonly payloads: IXyoPayload[]
}

export interface IXyoBoundWitnessSigningDataProducer {
  getSigningData (boundWitness: IXyoBoundWitness): Buffer
}
