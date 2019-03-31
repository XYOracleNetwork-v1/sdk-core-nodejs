/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 3rd December 2018 12:53:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 14th February 2019 2:25:08 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoPublicKey } from '@xyo-network/signing'
import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoConfig } from '@xyo-network/base'

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

  getIntersections(
    publicKeyA: string,
    publicKeyB: string,
    limit: number,
    cursor: string | undefined
  ): Promise<IXyoIntersectionsList>
}

export interface IXyoIntersectionsList {
  totalSize: number
  hasNextPage: boolean
  list: string[]
  cursor: string | undefined
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

export interface IArchivistRepositoryConfig extends IXyoConfig {
  platform: string /* mysql, level, neo4j, etc... */
}
