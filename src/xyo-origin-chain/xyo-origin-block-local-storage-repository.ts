/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th September 2018 4:29:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: origin-chain-manager.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 18th October 2018 5:08:47 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoStoragePriority } from '../xyo-storage/xyo-storage-priority';
import { IXyoStorageProvider, IXyoIterableStorageProvider } from '../@types/xyo-storage';
import { XyoBoundWitness } from '../xyo-bound-witness/bound-witness/xyo-bound-witness';
import { XyoOriginBlock } from './xyo-origin-block';
import { IXyoOriginBlockRepository, IOriginBlockQueryResult } from '../@types/xyo-origin-chain';
import { XyoHash } from '../xyo-hashing/xyo-hash';

/**
 * An XyoOriginChainNavigator exposes an api for managing
 * an origin chain
 */
export class XyoOriginBlockLocalStorageRepository implements IXyoOriginBlockRepository {

  /**
   * Creates an instance of a XyoOriginChainNavigator
   *
   * @param originBlocksStorageProvider A storage provider for storage management
   */

  constructor(
    private readonly originBlocksStorageProvider: IXyoStorageProvider,
    private readonly originBlockNextHashStorageProvider: IXyoStorageProvider
  ) {}

  /**
   * Removes an origin block from storage if it exists
   *
   * @param originBlockHash The hash of the origin block to remove
   */

  public async removeOriginBlock(originBlockHash: Buffer) {
    return this.originBlocksStorageProvider.delete(originBlockHash);
  }

  /**
   * Returns true if the block exists in storage corresponding to the hash, false otherwise
   * @param originBlockHash The hash of the block to query
   */

  public async containsOriginBlock (originBlockHash: Buffer) {
    return this.originBlocksStorageProvider.containsKey(originBlockHash);
  }

  public async getOriginBlocks(limit: number, offsetHash?: Buffer): Promise<IOriginBlockQueryResult> {
    const hashes = await this.getAllOriginBlockHashes();

    // If this is an iterable storage-provider, answer question that way
    if (instanceOfIterableStorageProvider(this.originBlocksStorageProvider)) {
      const result = await this.originBlocksStorageProvider.iterate({ limit, offsetKey: offsetHash });
      const serializer = XyoBoundWitness.getSerializer<XyoBoundWitness>();
      const blocks = result.items.map(keyPair => serializer.deserialize(keyPair.value));

      return {
        list: blocks,
        totalSize: hashes.length,
        hasNextPage: result.hasMoreItems
      };
    }

    const offsetIndex = offsetHash ? hashes.findIndex(hash => hash.equals(offsetHash)) : 0;

    if (offsetIndex === -1) {
      return {
        list: [],
        totalSize: hashes.length,
        hasNextPage: false
      };
    }

    const promises: Array<Promise<XyoBoundWitness>> = []; // tslint:disable-line:prefer-array-literal
    let index = 0;

    while (index < limit && ((index + offsetIndex) < hashes.length)) {
      promises.push(
        this.getOriginBlockByHash(hashes[index + offsetIndex]) as Promise<XyoBoundWitness>
      );
      index += 1;
    }

    const boundWitnesses = await Promise.all(promises);
    return {
      list: boundWitnesses,
      totalSize: hashes.length,
      hasNextPage: (index + offsetIndex) < hashes.length
    };
  }

  /**
   * Returns a list of all of origin blocks in the system
   */
  public async getAllOriginBlockHashes() {
    return this.originBlocksStorageProvider.getAllKeys();
  }

  /**
   * Adds a bound-witness, which is an origin block, to storage. Additionally it updates
   * any indexes that need to be updated
   */

  public async addOriginBlock(blockHash: XyoHash, originBlock: XyoBoundWitness): Promise<void> {
    const blockDataValue = originBlock.serialize(false);
    const blockHashValue = blockHash.serialize(true);

    const previousHashes = await new XyoOriginBlock(originBlock).findPreviousBlocks();
    const promises = previousHashes.map((hash) => {
      if (!hash) {
        return;
      }

      return this.originBlockNextHashStorageProvider.write(
        hash,
        blockHashValue,
        XyoStoragePriority.PRIORITY_MED,
        true,
        60000
      );
    });

    await Promise.all(promises);

    await this.originBlocksStorageProvider.write(
      blockHashValue,
      blockDataValue,
      XyoStoragePriority.PRIORITY_MED,
      true,
      60000
    );
  }

  public async getOriginBlockByHash(hash: Buffer): Promise<XyoBoundWitness | undefined> {
    try {
      const result = await this.originBlocksStorageProvider.read(hash, 60000);
      if (!result) {
        return undefined;
      }

      const serializer = XyoBoundWitness.getSerializer<XyoBoundWitness>();
      const boundWitness = serializer.deserialize(result);
      return boundWitness;
    } catch (err) {
      return undefined;
    }
  }
}

function instanceOfIterableStorageProvider(
  storageProvider: IXyoStorageProvider
): storageProvider is IXyoIterableStorageProvider {
  return 'iterate' in storageProvider;
}
