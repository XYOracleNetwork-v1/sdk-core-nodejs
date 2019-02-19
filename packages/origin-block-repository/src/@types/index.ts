/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 9:32:04 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th February 2019 10:01:11 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHash } from '@xyo-network/hashing'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'

/**
 * An `IXyoOriginBlockRepository` is abstraction for persistence
 * of OriginBlocks
 */
export interface IXyoOriginBlockRepository {

  getBlocksThatProviderAttribution(hash: Buffer): Promise<{[h: string]: IXyoBoundWitness}>

  /**
   * Deletes an origin-block corresponding to hash passed in
   */

  removeOriginBlock(hash: Buffer): Promise<void>

  /**
   * Returns true if the repository contains the block corresponding to the hash passed in
   */

  containsOriginBlock(hash: Buffer): Promise<boolean>

  /**
   * Returns a list of all the hashes the repository contains
   */

  getAllOriginBlockHashes(): Promise<Buffer[]>

  /**
   * Adds an origin-block to the repository and indexes to by the hash passed in
   */

  addOriginBlock(hash: IXyoHash, originBlock: IXyoBoundWitness, bridgedFromBlock?: IXyoHash): Promise<void>

  /**
   * Returns the origin block by the hash passed in. Otherwise, it returns `undefined`
   * if the repository does not contain a block for the hash
   */

  getOriginBlockByHash(hash: Buffer): Promise<IXyoBoundWitness | undefined>

  /**
   * Gets a list of Origin Blocks with pagination and cursor parameter
   *
   * @param {number} limit
   * @param {Buffer} [offsetHash]
   * @returns {Promise<IOriginBlockQueryResult>}
   * @memberof IXyoOriginBlockRepository
   */
  getOriginBlocks(limit: number, offsetHash?: Buffer): Promise<IOriginBlockQueryResult>
}

export interface IOriginBlockQueryResult {
  list: IXyoBoundWitness[]
  totalSize: number
  hasNextPage: boolean
}
