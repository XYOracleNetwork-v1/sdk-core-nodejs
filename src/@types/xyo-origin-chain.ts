/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 2:23:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 30th October 2018 3:53:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitness } from '../xyo-bound-witness/bound-witness/xyo-bound-witness';
import { XyoHash } from '../xyo-hashing/xyo-hash';
import { XyoIndex } from '../xyo-bound-witness/components/index/xyo-index';
import { XyoPreviousHash } from '../xyo-bound-witness/components/previous-hash/xyo-previous-hash';
import { IXyoSigner } from './xyo-signing';
import { XyoNextPublicKey } from '../xyo-bound-witness/components/next-public-key/xyo-next-public-key';

/**
 * An `IXyoOriginBlockRepository` is abstraction for persistence
 * of OriginBlocks
 */
export interface IXyoOriginBlockRepository {

  /**
   * Deletes an origin-block corresponding to hash passed in
   */

  removeOriginBlock(hash: Buffer): Promise<void>;

  /**
   * Returns true if the repository contains the block corresponding to the hash passed in
   */

  containsOriginBlock(hash: Buffer): Promise<boolean>;

  /**
   * Returns a list of all the hashes the repository contains
   */

  getAllOriginBlockHashes(): Promise<Buffer[]>;

  /**
   * Adds an origin-block to the repository and indexes to by the hash passed in
   */

  addOriginBlock(hash: XyoHash, originBlock: XyoBoundWitness): Promise<void>;

  /**
   * Returns the origin block by the hash passed in. Otherwise, it returns `undefined`
   * if the repository does not contain a block for the hash
   */

  getOriginBlockByHash(hash: Buffer): Promise<XyoBoundWitness | undefined>;

  /**
   * Gets a list of Origin Blocks with pagination and cursor parameter
   *
   * @param {number} limit
   * @param {Buffer} [offsetHash]
   * @returns {Promise<IOriginBlockQueryResult>}
   * @memberof IXyoOriginBlockRepository
   */
  getOriginBlocks(limit: number, offsetHash?: Buffer): Promise<IOriginBlockQueryResult>;
}

export interface IOriginBlockQueryResult {
  list: XyoBoundWitness[];
  totalSize: number;
  hasNextPage: boolean;
}

/**
 * Tracks the state of a particular `XyoNode` in the network. In particular,
 * this repository contains many of the values necessary to create another
 * block in the origin-chain
 */

export interface IXyoOriginChainStateRepository {
  /** Returns the index value that will go into the next block */
  getIndex(): Promise<XyoIndex>;

  /** Returns the previousHash value that will go into the next block */
  getPreviousHash(): Promise<XyoPreviousHash | undefined>;

  /** Returns the list of signers that will be used to sign the next block */
  getSigners(): Promise<IXyoSigner[]>;

  /** Adds a signer to the queue that will be used in a subsequent block */
  addSigner(signer: IXyoSigner): Promise<void>;

  /** Removes the oldest signer from the list of signers signing blocks */
  removeOldestSigner(): Promise<void>;

  /** Returns the nextPublicKey, if it exists, that will go into the next block */
  getNextPublicKey(): Promise<XyoNextPublicKey | undefined>;

  /**
   * Updates the origin-chain-state.
   *
   * The previousHash will be set to the hash passed in.
   * The index will be incremented.
   * And, signers will be rotated if there is a queue
   */

  updateOriginChainState(hash: XyoHash): Promise<void>;

  /** Returns a list of the signers waiting to be used */
  getWaitingSigners(): Promise<IXyoSigner[]>;

  /**
   * Overrides the queue behavior for setting the signers for next block,
   * and sets the passed in signers as the current signers
   */
  setCurrentSigners(signers: IXyoSigner[]): Promise<void>;

  /** Returns the first xyo-signer for the origin chain */
  getGenesisSigner(): Promise<IXyoSigner | undefined>;
}
