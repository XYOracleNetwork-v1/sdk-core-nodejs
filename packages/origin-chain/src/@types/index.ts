/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:02:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 5:08:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoHash } from '@xyo-network/hashing'
import { IXyoSigner, IXyoPublicKey } from '@xyo-network/signing'

/**
 * An `IXyoOriginBlockRepository` is abstraction for persistence
 * of OriginBlocks
 */
export interface IXyoOriginBlockRepository {

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

/**
 * Tracks the state of a particular `XyoNode` in the network. In particular,
 * this repository contains many of the values necessary to create another
 * block in the origin-chain
 */

export interface IXyoOriginChainStateRepository {
  /** Returns the index value that will go into the next block */
  getIndex(): Promise<number>

  /** Returns the previousHash value that will go into the next block */
  getPreviousHash(): Promise<IXyoHash | undefined>

  /** Returns the list of signers that will be used to sign the next block */
  getSigners(): Promise<IXyoSigner[]>

  /** Adds a signer to the queue that will be used in a subsequent block */
  addSigner(signer: IXyoSigner): Promise<void>

  /** Removes the oldest signer from the list of signers signing blocks */
  removeOldestSigner(): Promise<void>

  /** Returns the nextPublicKey, if it exists, that will go into the next block */
  getNextPublicKey(): Promise<IXyoPublicKey | undefined>

  /**
   * Updates the origin-chain-state.
   *
   * The previousHash will be set to the hash passed in.
   * The index will be incremented.
   * And, signers will be rotated if there is a queue
   */

  updateOriginChainState(hash: IXyoHash): Promise<void>

  /** Returns a list of the signers waiting to be used */
  getWaitingSigners(): Promise<IXyoSigner[]>

  /**
   * Overrides the queue behavior for setting the signers for next block,
   * and sets the passed in signers as the current signers
   */
  setCurrentSigners(signers: IXyoSigner[]): Promise<void>

  /** Returns the first xyo-signer for the origin chain */
  getGenesisSigner(): Promise<IXyoSigner | undefined>
}
