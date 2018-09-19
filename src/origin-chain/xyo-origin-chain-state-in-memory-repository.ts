/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 11th September 2018 10:09:26 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain-state-manager.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 3:17:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from '../components/hashing/xyo-hash';
import { XyoObject } from '../components/xyo-object';
import { XyoNextPublicKey } from '../components/signing/xyo-next-public-key';
import { XyoPreviousHash } from '../components/hashing/xyo-previous-hash';
import { XyoIndex } from '../components/heuristics/numbers/xyo-index';
import { XyoSigner } from '../signing/xyo-signer';
import { XyoOriginChainStateRepository } from './xyo-origin-chain-types';

/**
 * Encapsulates the values that go into an origin-chain managements
 */
export class XyoOriginChainStateInMemoryRepository implements XyoOriginChainStateRepository {

  /** A next public key value that is only set of if the xyo-node wishes to roll their current key */
  private nextPublicKey: XyoNextPublicKey | undefined = undefined;

  /** A list of signers to use for signing blocks */
  private readonly currentSigners: XyoSigner[] = [];

  /** Signers queued to use for the next blocks */
  private readonly waitingSigners: XyoSigner[] = [];

  /** The hash value of the block on top of the chain */
  private latestHash: XyoHash | undefined = undefined;

  /** The number of blocks in the origin chain */
  private count: number = 0;

  /** A list of hashes in the origin chain */
  private allHashes: XyoHash[] = [];

  /** All the public keys used by this node in the origin chain */
  private allPublicKeys: XyoObject[] = [];

  /**
   * Creates an instance of a XyoOriginChainStateManager
   * @param indexOffset Can be used if not all blocks in this manager are available.
   */

  constructor(private readonly indexOffset: number) {}

  /**
   * The index, or number of the blocks in the origin chain
   */

  private get index () {
    return new XyoIndex(this.count + this.indexOffset);
  }

  /**
   * Gets the previous hash value for the origin chain
   */

  private get previousHash (): XyoPreviousHash | undefined {
    const latestHashValue = this.latestHash;
    if (latestHashValue) {
      return new XyoPreviousHash(latestHashValue);
    }

    return undefined;
  }

  public async getIndex(): Promise<XyoIndex> {
    return this.index;
  }

  public async getPreviousHash(): Promise<XyoPreviousHash | undefined> {
    return this.previousHash;
  }

  public async getNextPublicKey(): Promise<XyoNextPublicKey | undefined> {
    return this.nextPublicKey;
  }

  public async updateOriginChainState(hash: XyoHash): Promise<void> {
    this.newOriginBlock(hash);
  }

  /**
   * A list of signers that will be used in signing bound witnesses
   */

  public async getSigners() {
    return this.currentSigners;
  }

  /**
   * Adds a signer to be used in the next bound-witness interaction
   */

  public async addSigner(signer: XyoSigner) {
    const publicKey = signer.publicKey;
    this.nextPublicKey = new XyoNextPublicKey(publicKey);
    this.waitingSigners.push(signer);
    this.allPublicKeys.push(publicKey);
  }

  /**
   * Removes the oldest signer for the list of signers such that
   * the signer removed will not be used in signing bound witnesses
   * in the future
   */

  public async removeOldestSigner() {
    if (this.currentSigners.length > 0) {
      this.currentSigners.splice(0, 1);
    }
  }

  /**
   * Sets the state so that the chain is ready for a new origin block
   */

  private newOriginBlock(hash: XyoHash) {
    this.nextPublicKey = undefined;
    this.allHashes.push(hash);
    this.latestHash = hash;
    this.count += 1;
    this.addWaitingSigner();
  }

  /**
   * Adds the next waiting signer to the list of signers to be used in signing bound witnesses
   */

  private addWaitingSigner() {
    if (this.waitingSigners.length > 0) {
      this.currentSigners.push(this.waitingSigners[0]);
      this.waitingSigners.splice(1, 0);
    }
  }
}
