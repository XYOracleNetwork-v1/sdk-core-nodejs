/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 3:27:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain-local-storage-repository.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 12:24:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoOriginChainStateRepository } from './xyo-origin-chain-types';
import { XyoIndex } from '../components/heuristics/numbers/xyo-index';
import { XyoPreviousHash } from '../components/hashing/xyo-previous-hash';
import { XyoSigner } from '../signing/xyo-signer';
import { XyoNextPublicKey } from '../signing/xyo-next-public-key';
import { XyoHash } from '../components/hashing/xyo-hash';
import { XYOStorageProvider, XyoStorageProviderPriority } from '../storage/xyo-storage-provider';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoOriginChainStateInMemoryRepository } from './xyo-origin-chain-state-in-memory-repository';

export class XyoOriginChainLocalStorageRepository implements XyoOriginChainStateRepository {

  private inMemoryDelegate: XyoOriginChainStateInMemoryRepository | undefined;

  constructor (
    private readonly storageProvider: XYOStorageProvider,
    private readonly packer: XyoPacker
  ) {}

  public async getIndex(): Promise<XyoIndex> {
    return (await this.getOrCreateInMemoryDelegate()).getIndex();
  }

  public async getPreviousHash(): Promise<XyoPreviousHash | undefined> {
    return (await this.getOrCreateInMemoryDelegate()).getPreviousHash();
  }

  public async getSigners(): Promise<XyoSigner[]> {
    return (await this.getOrCreateInMemoryDelegate()).getSigners();
  }

  public async addSigner(signer: XyoSigner): Promise<void> {
    const delegate = await this.getOrCreateInMemoryDelegate();
    await delegate.addSigner(signer);
    await this.saveOriginChainState(delegate);
  }

  public async removeOldestSigner(): Promise<void> {
    const delegate = await this.getOrCreateInMemoryDelegate();
    await delegate.removeOldestSigner();
    await this.saveOriginChainState(delegate);
  }

  public async getNextPublicKey(): Promise<XyoNextPublicKey | undefined> {
    return (await this.getOrCreateInMemoryDelegate()).getNextPublicKey();
  }

  public async getWaitingSigners() {
    return (await this.getOrCreateInMemoryDelegate()).getWaitingSigners();
  }

  public async updateOriginChainState(hash: XyoHash): Promise<void> {
    const delegate = await this.getOrCreateInMemoryDelegate();
    await delegate.updateOriginChainState(hash);
    await this.saveOriginChainState(delegate);
    return;
  }

  private async getOrCreateInMemoryDelegate() {
    if (this.inMemoryDelegate) {
      return this.inMemoryDelegate;
    }

    try {
      const stored = await this.storageProvider.read(Buffer.from('current-state.json'), 60000);
      if (stored) {
        this.inMemoryDelegate = this.deserializeOriginChainState(stored.toString());
        return this.inMemoryDelegate;
      }
    } catch (err) {
      // expected error if does not exist
    }

    this.inMemoryDelegate = new XyoOriginChainStateInMemoryRepository(0, undefined, [], undefined, []);
    await this.saveOriginChainState(this.inMemoryDelegate);
    return this.inMemoryDelegate;
  }

  private async saveOriginChainState(originState: XyoOriginChainStateInMemoryRepository) {
    const jsonString = await this.serializeOriginChainState(originState);
    try {
      await this.storageProvider.delete(Buffer.from('current-state.json'));
    } catch (err) {
      // expected error
    }

    await this.storageProvider.write(
      Buffer.from('current-state.json'),
      Buffer.from(jsonString),
      XyoStorageProviderPriority.PRIORITY_HIGH,
      true,
      60000
    );
  }

  private deserializeOriginChainState(jsonString: string): XyoOriginChainStateInMemoryRepository {
    const obj = JSON.parse(jsonString) as SerializedOriginChainState;
    const index = this.packer.deserialize(Buffer.from(obj.index, 'hex')) as XyoIndex;
    const signers = obj.signers.map((signer) => {
      return this.packer.deserialize(Buffer.from(signer, 'hex'));
    }) as XyoSigner[];

    const waitingSigners = obj.waitingSigners.map((signer) => {
      return this.packer.deserialize(Buffer.from(signer, 'hex'));
    }) as XyoSigner[];

    const previousHash = obj.previousHash ?
      this.packer.deserialize(Buffer.from(obj.previousHash, 'hex')) as XyoPreviousHash :
      undefined;

    const nextPublicKey = obj.nextPublicKey ?
      this.packer.deserialize(Buffer.from(obj.nextPublicKey, 'hex')) as XyoNextPublicKey :
      undefined;

    return new XyoOriginChainStateInMemoryRepository(
      index.number,
      (previousHash && previousHash.hash) || undefined,
      signers,
      nextPublicKey,
      waitingSigners
    );
  }

  private async serializeOriginChainState(originChainState: XyoOriginChainStateInMemoryRepository) {
    const index = await originChainState.getIndex();
    const nextPublicKey = await originChainState.getNextPublicKey();
    const previousHash = await originChainState.getPreviousHash();
    const signers = await originChainState.getSigners();
    const waitingSigners = await originChainState.getWaitingSigners();

    const payload: SerializedOriginChainState = {
      index: this.packer.serialize(index, index.major, index.minor, true).toString('hex'),
      signers: signers.map((signer) => {
        return this.packer.serialize(signer, signer.major, signer.minor, true).toString('hex');
      }),
      waitingSigners: waitingSigners.map((signer) => {
        return this.packer.serialize(signer, signer.major, signer.minor, true).toString('hex');
      }),
      nextPublicKey: null,
      previousHash: null,
    };

    if (nextPublicKey) {
      payload.nextPublicKey = this.packer.serialize(
        nextPublicKey, nextPublicKey.major, nextPublicKey.minor, true
      ).toString('hex');
    }

    if (previousHash) {
      payload.previousHash = this.packer.serialize(
        previousHash, previousHash.major, previousHash.minor, true
      ).toString('hex');
    }

    return JSON.stringify(payload);
  }
}

interface SerializedOriginChainState {
  index: string;
  signers: string[];
  waitingSigners: string[];
  nextPublicKey: string | null;
  previousHash: string | null;
}
