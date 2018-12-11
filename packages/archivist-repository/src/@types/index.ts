/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 3rd December 2018 12:53:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 3rd December 2018 1:04:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoPublicKey } from '@xyo-network/signing'
import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoHash } from '@xyo-network/hashing'

/**
 * A persistance abstraction for an XyoArchivist. This interface powers
 * the graphql api
 */

export interface IXyoArchivistRepository extends IXyoOriginBlockRepository {

  /**
   * Will return all the origin-blocks for a particular public-key
   * and any other public-keys determined to be equivalent to the public-key passed in
   */
  getOriginBlocksByPublicKey(publicKey: IXyoPublicKey): Promise<IXyoOriginBlocksByPublicKeyResult>

  /**
   * Given a limit, and optionally a cursor, returns an a list of the
   * known entities in the system.
   *
   * An entity is defined by an owner of a particular origin-chain
   *
   * @param {number} limit
   * @param {(string | undefined)} cursor
   * @returns {Promise<IXyoEntitiesList>}
   * @memberof IXyoArchivistRepository
   */
  getEntities(limit: number, cursor: string | undefined): Promise<IXyoEntitiesList>
}

export interface IXyoEntityType {
  sentinel: boolean
  bridge: boolean
  archivist: boolean
  diviner: boolean
}

export interface IXyoEntity {
  firstKnownPublicKey: IXyoPublicKey
  allPublicKeys?: IXyoPublicKey[]
  type: IXyoEntityType
  mostRecentIndex?: number
  mostRecentBlockHash?: IXyoHash
  mostRecentPublicKeys?: IXyoPublicKey[]
}

export interface IXyoEntitiesList {
  totalSize: number
  hasNextPage: boolean
  list: IXyoEntity[]
  cursor: string | undefined
}

export interface IXyoOriginBlockResult {
  publicKeys: IXyoPublicKey[]
}

export interface IXyoOriginBlocksByPublicKeyResult {
  publicKeys: IXyoPublicKey[]
  boundWitnesses: IXyoBoundWitness[]
}
