/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th December 2018 9:58:27 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain-local-storage-repository.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 1:52:49 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoOriginChainRepository, IBlockInOriginChainResult, IXyoOriginChainMutex } from './@types'
import { XyoOriginChainStateInMemoryRepository } from './xyo-origin-chain-in-memory-repository'
import { IXyoStorageProvider } from '@xyo-network/storage'
import { IXyoSigner, IXyoPublicKey } from '@xyo-network/signing'
import { IXyoHash } from '@xyo-network/hashing'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { XyoNextPublicKey } from './xyo-next-public-key'
import { XyoBase } from '@xyo-network/base'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'

export class XyoOriginChainLocalStorageRepository extends XyoBase implements IXyoOriginChainRepository {

  private inMemoryDelegate: XyoOriginChainStateInMemoryRepository | undefined

  constructor (
    private readonly storageProvider: IXyoStorageProvider,
    private readonly originBlockResolver: IXyoOriginBlockByHash,
    private readonly serializationService: IXyoSerializationService
  ) {
    super()
  }

  public async acquireMutex() {
    return (await this.getOrCreateInMemoryDelegate()).acquireMutex()
  }

  public async releaseMutex(mutex: IXyoOriginChainMutex) {
    return (await this.getOrCreateInMemoryDelegate()).releaseMutex(mutex)
  }

  public async canAcquireMutex() {
    return (await this.getOrCreateInMemoryDelegate()).canAcquireMutex()
  }

  public async isBlockInOriginChain(block: IXyoBoundWitness, hash: IXyoHash): Promise<IBlockInOriginChainResult> {
    return (await this.getOrCreateInMemoryDelegate()).isBlockInOriginChain(block, hash)
  }

  public async publicKeyBelongsToOriginChain(publicKey: IXyoPublicKey): Promise<boolean> {
    return (await this.getOrCreateInMemoryDelegate()).publicKeyBelongsToOriginChain(publicKey)
  }

  public async getAllPublicKeysForOriginChain(): Promise<IXyoPublicKey[]> {
    return (await this.getOrCreateInMemoryDelegate()).getAllPublicKeysForOriginChain()
  }

  public async getOriginChainHashes(): Promise<IXyoHash[]> {
    return (await this.getOrCreateInMemoryDelegate()).getOriginChainHashes()
  }

  public async getInteractionWithPublicKey(publicKey: IXyoPublicKey): Promise<IXyoHash[]> {
    return (await this.getOrCreateInMemoryDelegate()).getInteractionWithPublicKey(publicKey)
  }

  public async createGenesisBlock(): Promise<IXyoBoundWitness> {
    return (await this.getOrCreateInMemoryDelegate()).createGenesisBlock()
  }

  public async getIndex() {
    return (await this.getOrCreateInMemoryDelegate()).getIndex()
  }

  public async getPreviousHash() {
    return (await this.getOrCreateInMemoryDelegate()).getPreviousHash()
  }

  public async getGenesisSigner() {
    return (await this.getOrCreateInMemoryDelegate()).getGenesisSigner()
  }

  public async getSigners() {
    return (await this.getOrCreateInMemoryDelegate()).getSigners()
  }

  public async addSigner(signer: IXyoSigner) {
    const delegate = await this.getOrCreateInMemoryDelegate()
    await delegate.addSigner(signer)
    await this.saveOriginChainState(delegate)
  }

  public async removeOldestSigner() {
    const delegate = await this.getOrCreateInMemoryDelegate()
    await delegate.removeOldestSigner()
    await this.saveOriginChainState(delegate)
  }

  public async getNextPublicKey() {
    return (await this.getOrCreateInMemoryDelegate()).getNextPublicKey()
  }

  public async getWaitingSigners() {
    return (await this.getOrCreateInMemoryDelegate()).getWaitingSigners()
  }

  public async updateOriginChainState(hash: IXyoHash, block: IXyoBoundWitness) {
    const delegate = await this.getOrCreateInMemoryDelegate()
    await delegate.updateOriginChainState(hash, block)
    await this.saveOriginChainState(delegate)
    return
  }

  public async setCurrentSigners(signers: IXyoSigner[]) {
    const delegate = await this.getOrCreateInMemoryDelegate()
    await delegate.setCurrentSigners(signers)
    const currentIndex = await delegate.getIndex()

    if (currentIndex === 0 && signers.length > 0) {
      delegate.genesisSigner = signers[0]
    }

    await this.saveOriginChainState(delegate)
    return
  }

  private async getOrCreateInMemoryDelegate() {
    if (this.inMemoryDelegate) {
      return this.inMemoryDelegate
    }

    try {
      const stored = await this.storageProvider.read(Buffer.from('current-state'))
      if (stored) {
        this.inMemoryDelegate = this.deserializeOriginChainState(stored.toString())
        return this.inMemoryDelegate
      }
    } catch (err) {
      // expected error if does not exist
    }

    this.inMemoryDelegate = new XyoOriginChainStateInMemoryRepository(
      0,
      [],
      [],
      this.originBlockResolver,
      [],
      undefined,
      [],
      this.serializationService
    )

    await this.saveOriginChainState(this.inMemoryDelegate)
    return this.inMemoryDelegate
  }

  private async saveOriginChainState(originState: XyoOriginChainStateInMemoryRepository) {
    const jsonString = await this.serializeOriginChainState(originState)
    try {
      await this.storageProvider.delete(Buffer.from('current-state'))
    } catch (err) {
      // expected error
    }

    await this.storageProvider.write(Buffer.from('current-state'), Buffer.from(jsonString))
  }

  private deserializeOriginChainState(jsonString: string): XyoOriginChainStateInMemoryRepository {
    const obj = JSON.parse(jsonString) as ISerializedOriginChainState
    const index = obj.index
    const signers = obj.signers.map((signer) => {
      return this.serializationService
        .deserialize(Buffer.from(signer, 'hex'))
        .hydrate<IXyoSigner>()
    }) as IXyoSigner[]

    const waitingSigners = obj.waitingSigners.map((signer) => {
      return this.serializationService
        .deserialize(Buffer.from(signer, 'hex'))
        .hydrate<IXyoSigner>()
    }) as IXyoSigner[]

    const hashes = obj.hashes.map(h => this.serializationService
        .deserialize(Buffer.from(h, 'hex'))
        .hydrate<IXyoHash>()
    )

    const publicKeys = obj.publicKeys.map(pk => this.serializationService
        .deserialize(Buffer.from(pk, 'hex'))
        .hydrate<IXyoPublicKey>()
    )

    const nextPublicKey = obj.nextPublicKey ?
      this.serializationService
        .deserialize(Buffer.from(obj.nextPublicKey, 'hex'))
        .hydrate<XyoNextPublicKey>() :
      undefined

    const genesisSigner = obj.genesisSigner ?
      this.serializationService
      .deserialize(Buffer.from(obj.genesisSigner, 'hex'))
      .hydrate<IXyoSigner>() :
      undefined

    return new XyoOriginChainStateInMemoryRepository(
      index,
      hashes,
      publicKeys,
      this.originBlockResolver,
      signers,
      (nextPublicKey && nextPublicKey.publicKey) || undefined,
      waitingSigners,
      this.serializationService,
      genesisSigner
    )
  }

  private async serializeOriginChainState(originChainState: XyoOriginChainStateInMemoryRepository) {
    const index = await originChainState.getIndex()
    const nextPublicKey = await originChainState.getNextPublicKey()
    const hashes = await originChainState.getOriginChainHashes()
    const publicKeys = await originChainState.getAllPublicKeysForOriginChain()
    const signers = await originChainState.getSigners()
    const waitingSigners = await originChainState.getWaitingSigners()
    const genesisSigner = await originChainState.getGenesisSigner()

    const payload: ISerializedOriginChainState = {
      index,
      publicKeys: publicKeys.map(pk => pk.serializeHex()),
      signers: signers.map((signer) => {
        return signer.serializeHex()
      }),
      waitingSigners: waitingSigners.map((signer) => {
        return signer.serializeHex()
      }),
      nextPublicKey: null,
      hashes: hashes.map(h => h.serializeHex()),
      genesisSigner: genesisSigner && genesisSigner.serializeHex() || null
    }

    if (nextPublicKey) {
      payload.nextPublicKey = nextPublicKey.serializeHex()
    }

    return JSON.stringify(payload)
  }
}

interface ISerializedOriginChainState {
  index: number
  signers: string[]
  publicKeys: string[]
  waitingSigners: string[]
  nextPublicKey: string | null
  hashes: string[]
  genesisSigner: string | null
}

interface IXyoOriginBlockByHash {
  getOriginBlockByHash(hash: Buffer): Promise<IXyoBoundWitness | undefined>
}
