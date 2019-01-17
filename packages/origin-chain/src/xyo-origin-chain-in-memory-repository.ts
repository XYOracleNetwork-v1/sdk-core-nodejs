/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 1:38:47 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain-in-memory-repository.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 16th January 2019 5:05:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHash } from '@xyo-network/hashing'
import { IXyoSigner, IXyoPublicKey } from '@xyo-network/signing'
import { IXyoOriginChainRepository } from './@types'
import { XyoBase } from '@xyo-network/base'
import { IXyoBoundWitness, XyoKeySet, XyoFetter, XyoBoundWitness, XyoWitness, XyoSignatureSet } from '@xyo-network/bound-witness'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { XyoIndex } from './xyo-index'

/**
 * Encapsulates the values that go into an origin-chain managements
 */
export class XyoOriginChainStateInMemoryRepository extends XyoBase implements IXyoOriginChainRepository {

  /** The index of the block in the origin chain */
  private idx: number

  constructor(
    index: number,
    private latestHash: IXyoHash | undefined,
    private readonly currentSigners: IXyoSigner[],
    private nextPublicKey: IXyoPublicKey | undefined,
    private readonly waitingSigners: IXyoSigner[],
    public genesisSigner?: IXyoSigner
  ) {
    super()
    this.idx = index
  }

  /**
   * The index, or number of the blocks in the origin chain
   */

  private get index (): number {
    return this.idx
  }

  /**
   * Gets the previous hash value for the origin chain
   */

  private get previousHash (): IXyoHash | undefined {
    return this.latestHash || undefined
  }

  public async getIndex(): Promise<number> {
    return this.index
  }

  public async createGenesisBlock(): Promise<IXyoBoundWitness> {
    const currentIndex = await this.getIndex()

    if (currentIndex !== 0) {
      throw new XyoError(`Could not create Genesis block as one already exists`, XyoErrors.CRITICAL)
    }

    this.logInfo(`Creating genesis block`)
    const signers = await this.getSigners()

    const fetter = new XyoFetter(
      new XyoKeySet(signers.map(signer => signer.publicKey)),
      [new XyoIndex(0)]
    )

    const signingData = fetter.serialize()
    const signatures = await Promise.all(signers.map(signer => signer.signData(signingData)))
    const genesisBlock = new XyoBoundWitness([
      fetter,
      new XyoWitness(new XyoSignatureSet(signatures), [])
    ])

    return genesisBlock
  }

  public async getPreviousHash(): Promise<IXyoHash | undefined> {
    return this.previousHash
  }

  public async getNextPublicKey(): Promise<IXyoPublicKey | undefined> {
    return this.nextPublicKey
  }

  public async getWaitingSigners(): Promise<IXyoSigner[]> {
    return this.waitingSigners
  }

  public async updateOriginChainState(hash: IXyoHash): Promise<void> {
    this.newOriginBlock(hash)
  }

  /**
   * A list of signers that will be used in signing bound witnesses
   */

  public async getSigners() {
    return this.currentSigners
  }

  /**
   * Adds a signer to be used in the next bound-witness interaction.
   */

  public async addSigner(signer: IXyoSigner) {
    this.nextPublicKey = signer.publicKey
    this.waitingSigners.push(signer)
  }

  /**
   * Set the current signers
   * @param signers A collection of signers to set for the current block
   */
  public async setCurrentSigners(signers: IXyoSigner[]) {
    // this.currentSigners is immutable, so we empty then fill up the array
    while (this.currentSigners.length) {
      this.currentSigners.pop()
    }

    this.currentSigners.push(...signers)
  }

  /**
   * Removes the oldest signer for the list of signers such that
   * the signer removed will not be used in signing bound witnesses
   * in the future
   */

  public async removeOldestSigner() {
    if (this.currentSigners.length > 0) {
      this.currentSigners.splice(0, 1)
    }
  }

  public async getGenesisSigner(): Promise<IXyoSigner | undefined > {
    return this.genesisSigner
  }

  /**
   * Sets the state so that the chain is ready for a new origin block
   */

  private newOriginBlock(hash: IXyoHash) {
    this.nextPublicKey = undefined
    this.latestHash = hash
    if (this.idx === 0) {
      this.logInfo(`Updating genesis signer`)
      this.genesisSigner = this.currentSigners.length > 0 ? this.currentSigners[0] : this.genesisSigner
    }
    this.idx += 1
    this.addWaitingSigner()
  }

  /**
   * Adds the next waiting signer to the list of signers to be used in signing bound witnesses
   */

  private addWaitingSigner() {
    if (this.waitingSigners.length > 0) {
      this.currentSigners.push(this.waitingSigners[0])
      this.waitingSigners.splice(0, 1)
    }
  }
}
