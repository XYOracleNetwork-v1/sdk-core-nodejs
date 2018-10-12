/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 11th September 2018 10:09:26 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain-state-manager.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:12:35 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from '../xyo-hashing/xyo-hash';
import { XyoNextPublicKey } from '../xyo-bound-witness/components/next-public-key/xyo-next-public-key';
import { XyoPreviousHash } from '../xyo-bound-witness/components/previous-hash/xyo-previous-hash';
import { XyoIndex } from '../xyo-bound-witness/components/index/xyo-index';
import { IXyoSigner } from '../@types/xyo-signing';
import { IXyoOriginChainStateRepository } from '../@types/xyo-origin-chain';

/**
 * Encapsulates the values that go into an origin-chain managements
 */
export class XyoOriginChainStateInMemoryRepository implements IXyoOriginChainStateRepository {

  /** The index of the block in the origin chain */
  private idx: number;

  constructor(
    index: number,
    private latestHash: XyoHash | undefined,
    private readonly currentSigners: IXyoSigner[],
    private nextPublicKey: XyoNextPublicKey | undefined,
    private readonly waitingSigners: IXyoSigner[],
  ) {
    this.idx = index;
  }

  /**
   * The index, or number of the blocks in the origin chain
   */

  private get index () {
    return new XyoIndex(this.idx);
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

  public async getWaitingSigners(): Promise<IXyoSigner[]> {
    return this.waitingSigners;
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
   * Adds a signer to be used in the next bound-witness interaction.
   */

  public async addSigner(signer: IXyoSigner) {
    this.nextPublicKey = new XyoNextPublicKey(signer.publicKey);
    this.waitingSigners.push(signer);
  }

  /**
   * Set the current signers
   * @param signers A collection of signers to set for the current block
   */
  public async setCurrentSigners(signers: IXyoSigner[]) {
    // this.currentSigners is immutable, so we empty then fill up the array
    while (this.currentSigners.length) {
      this.currentSigners.pop();
    }

    while (signers.length) {
      this.currentSigners.push(signers.pop()!);
    }
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
    this.latestHash = hash;
    this.idx += 1;
    this.addWaitingSigner();
  }

  /**
   * Adds the next waiting signer to the list of signers to be used in signing bound witnesses
   */

  private addWaitingSigner() {
    if (this.waitingSigners.length > 0) {
      this.currentSigners.push(this.waitingSigners[0]);
      this.waitingSigners.splice(0, 1);
    }
  }
}
