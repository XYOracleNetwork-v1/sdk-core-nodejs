/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:02:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 22nd February 2019 10:14:01 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHash } from '@xyo-network/hashing'
import { IXyoSigner, IXyoPublicKey } from '@xyo-network/signing'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'

export interface IXyoOriginChainMutex {
  [k: string]: any
  isActive: boolean
}

/**
 * Tracks the state of a particular `XyoNode` in the network. In particular,
 * this repository contains many of the values necessary to create another
 * block in the origin-chain
 */

export interface IXyoOriginChainRepository {

  acquireMutex(): Promise<IXyoOriginChainMutex | undefined>

  releaseMutex(mutex: IXyoOriginChainMutex): Promise<void>

  canAcquireMutex(): Promise<boolean>

  /** Will create a genesis block if one does not yet exist */
  createGenesisBlock(): Promise<IXyoBoundWitness>

  /** Returns the index value that will go into the next block */
  getIndex(): Promise<number>

  /** Returns the previousHash value that will go into the next block */
  getPreviousHash(): Promise<IXyoHash | undefined>

  /** Returns the list of signers that will be used to sign the next block */
  getSigners(): Promise<IXyoSigner[]>

  /** Adds a signer to the queue that will be used in a subsequent block */
  addSigner(signer: IXyoSigner, mutex?: IXyoOriginChainMutex): Promise<void>

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

  updateOriginChainState(hash: IXyoHash, block: IXyoBoundWitness, mutex: any): Promise<void>

  /** Returns a list of the signers waiting to be used */
  getWaitingSigners(): Promise<IXyoSigner[]>

  /**
   * Overrides the queue behavior for setting the signers for next block,
   * and sets the passed in signers as the current signers
   */
  setCurrentSigners(signers: IXyoSigner[], mutex: IXyoOriginChainMutex): Promise<void>

  /** Returns the first xyo-signer for the origin chain */
  getGenesisSigner(): Promise<IXyoSigner | undefined>

  getInteractionWithPublicKey(publicKey: IXyoPublicKey): Promise<IXyoHash[]>

  getOriginChainHashes(): Promise<IXyoHash[]>

  isBlockInOriginChain(block: IXyoBoundWitness, hash: IXyoHash): Promise<IBlockInOriginChainResult>

  publicKeyBelongsToOriginChain(publicKey: IXyoPublicKey): Promise<boolean>

  getAllPublicKeysForOriginChain(): Promise<IXyoPublicKey[]>
}

export interface IBlockInOriginChainResult {
  /**
   * Returns true if it is a block in the origin-chain, false otherwise
   *
   * @type {boolean}
   * @memberof IBlockInOriginChainResult
   */
  result: boolean,

  /**
   * If it is a block in the origin chain this will return this index of the party.
   * If the block does not belong to origin-chain the result will be undefined
   *
   * @type {(number | undefined)}
   * @memberof IBlockInOriginChainResult
   */
  indexOfPartyInBlock: number | undefined
}
