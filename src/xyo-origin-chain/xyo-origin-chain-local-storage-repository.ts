/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 3:27:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain-local-storage-repository.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 12th October 2018 9:38:06 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoOriginChainStateRepository } from '../@types/xyo-origin-chain';
import { XyoIndex } from '../xyo-bound-witness/components/index/xyo-index';
import { XyoPreviousHash } from '../xyo-bound-witness/components/previous-hash/xyo-previous-hash';
import { IXyoSigner } from '../@types/xyo-signing';
import { XyoNextPublicKey } from '../xyo-bound-witness/components/next-public-key/xyo-next-public-key';
import { XyoHash } from '../xyo-hashing/xyo-hash';
import { XyoStoragePriority } from '../xyo-storage/xyo-storage-priority';
import { IXyoStorageProvider } from '../@types/xyo-storage';
import { XyoOriginChainStateInMemoryRepository } from './xyo-origin-chain-state-in-memory-repository';
import { XyoObject } from '../xyo-core-components/xyo-object';

export class XyoOriginChainLocalStorageRepository implements IXyoOriginChainStateRepository {

  private inMemoryDelegate: XyoOriginChainStateInMemoryRepository | undefined;

  constructor (
    private readonly storageProvider: IXyoStorageProvider
  ) {}

  public async getIndex(): Promise<XyoIndex> {
    return (await this.getOrCreateInMemoryDelegate()).getIndex();
  }

  public async getPreviousHash(): Promise<XyoPreviousHash | undefined> {
    return (await this.getOrCreateInMemoryDelegate()).getPreviousHash();
  }

  public async getSigners(): Promise<IXyoSigner[]> {
    return (await this.getOrCreateInMemoryDelegate()).getSigners();
  }

  public async addSigner(signer: IXyoSigner): Promise<void> {
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

  public async setCurrentSigners(signers: IXyoSigner[]): Promise<void> {
    const delegate = await this.getOrCreateInMemoryDelegate();
    await delegate.setCurrentSigners(signers);
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
      XyoStoragePriority.PRIORITY_HIGH,
      true,
      60000
    );
  }

  private deserializeOriginChainState(jsonString: string): XyoOriginChainStateInMemoryRepository {
    const obj = JSON.parse(jsonString) as ISerializedOriginChainState;
    const index = XyoObject.deserialize(Buffer.from(obj.index, 'hex')) as XyoIndex;
    const signers = obj.signers.map((signer) => {
      return XyoObject.deserialize(Buffer.from(signer, 'hex'));
    }) as IXyoSigner[];

    const waitingSigners = obj.waitingSigners.map((signer) => {
      return XyoObject.deserialize(Buffer.from(signer, 'hex'));
    }) as IXyoSigner[];

    const previousHash = obj.previousHash ?
      XyoObject.deserialize(Buffer.from(obj.previousHash, 'hex')) as XyoPreviousHash :
      undefined;

    const nextPublicKey = obj.nextPublicKey ?
      XyoObject.deserialize(Buffer.from(obj.nextPublicKey, 'hex')) as XyoNextPublicKey :
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

    const payload: ISerializedOriginChainState = {
      index: index.serialize(true).toString('hex'),
      signers: signers.map((signer) => {
        return signer.serialize(true).toString('hex');
      }),
      waitingSigners: waitingSigners.map((signer) => {
        return signer.serialize(true).toString('hex');
      }),
      nextPublicKey: null,
      previousHash: null,
    };

    if (nextPublicKey) {
      payload.nextPublicKey = nextPublicKey.serialize(true).toString('hex');
    }

    if (previousHash) {
      payload.previousHash = previousHash.serialize(true).toString('hex');
    }

    return JSON.stringify(payload);
  }
}

interface ISerializedOriginChainState {
  index: string;
  signers: string[];
  waitingSigners: string[];
  nextPublicKey: string | null;
  previousHash: string | null;
}
