/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 3:27:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain-local-storage-repository.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 6:08:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoOriginChainStateRepository } from './xyo-origin-chain-types';
import { XyoIndex } from '../components/heuristics/numbers/xyo-index';
import { XyoPreviousHash } from '../components/hashing/xyo-previous-hash';
import { XyoSigner } from '../signing/xyo-signer';
import { XyoNextPublicKey } from '../components/signing/xyo-next-public-key';
import { XyoHash } from '../components/hashing/xyo-hash';
import { XYOStorageProvider, XyoStorageProviderPriority } from '../storage/xyo-storage-provider';
import { XyoPacker } from '../xyo-packer/xyo-packer';

export class XyoOriginChainLocalStorageRepository implements XyoOriginChainStateRepository {

  constructor (
    private readonly storageProvider: XYOStorageProvider,
    private readonly packer: XyoPacker
  ) {}

  public async getIndex(): Promise<XyoIndex> {
    try {
      const indexBuffer = await this.storageProvider.read(
        Buffer.from('index'),
        60000
      );
      const index = indexBuffer ? indexBuffer.readUInt32BE(0) : 0;
      return new XyoIndex(index);
    } catch (err) {
      return new XyoIndex(0);
    }
  }

  public async getPreviousHash(): Promise<XyoPreviousHash | undefined> {
    try {
      const previousHashBuffer = await this.storageProvider.read(
        Buffer.from('previousHashBuffer'),
        60000
      );
      if (!previousHashBuffer) {
        return undefined;
      }

      return this.packer.deserialize(previousHashBuffer) as XyoPreviousHash;
    } catch (err) {
      return undefined;
    }
  }

  public async getSigners(): Promise<XyoSigner[]> {
    return [];
  }

  public async addSigner(signer: XyoSigner): Promise<void> {
    return;
  }

  public async removeOldestSigner(): Promise<void> {
    return;
  }

  public async getNextPublicKey(): Promise<XyoNextPublicKey | undefined> {
    try {
      const nextPublicKeyBuffer = await this.storageProvider.read(
        Buffer.from('nextPublicKeyBuffer'),
        60000
      );
      if (!nextPublicKeyBuffer) {
        return undefined;
      }

      return this.packer.deserialize(nextPublicKeyBuffer) as XyoNextPublicKey;
    } catch (err) {
      return undefined;
    }
  }

  public async updateOriginChainState(hash: XyoHash): Promise<void> {
    try {
      await this.storageProvider.delete(Buffer.from('nextPublicKeyBuffer'));
    } catch (err) {
      // ignore, file doesn't exist
    }

    try {
      await this.storageProvider.delete(Buffer.from('previousHashBuffer'));
    } catch (err) {
      // ignore, file doesnt exist
    }

    const currentIndex = await this.getIndex();

    try {
      await this.storageProvider.delete(Buffer.from('index'));
    } catch (err) {
      // ignore, file doesn't exist
    }

    const previousHash = new XyoPreviousHash(hash);
    const typedPreviousHashSerialization = this.packer.serialize(
      previousHash, previousHash.major, previousHash.minor, true
    );

    await this.storageProvider.write(
      Buffer.from('previousHashBuffer'),
      typedPreviousHashSerialization,
      XyoStorageProviderPriority.PRIORITY_HIGH,
      true,
      60000
    );

    const newIndex = new XyoIndex(currentIndex.number);
    const typedNewIndexSerialization = this.packer.serialize(
      newIndex, newIndex.major, newIndex.minor, true
    );
    await this.storageProvider.write(
      Buffer.from('index'),
      typedNewIndexSerialization,
      XyoStorageProviderPriority.PRIORITY_HIGH,
      true,
      60000
    );
  }
}
