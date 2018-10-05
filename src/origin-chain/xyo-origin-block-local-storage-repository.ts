/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th September 2018 4:29:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: origin-chain-manager.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 4th October 2018 2:32:19 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOStorageProvider, XyoStorageProviderPriority } from '../storage/xyo-storage-provider';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoOriginBlock } from './xyo-origin-block';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoOriginBlockRepository } from './xyo-origin-chain-types';
import { XyoHash } from '../components/hashing/xyo-hash';

/**
 * An XyoOriginChainNavigator exposes an api for managing
 * an origin chain
 */
export class XyoOriginBlockLocalStorageRepository implements XyoOriginBlockRepository {

  /**
   * Creates an instance of a XyoOriginChainNavigator
   *
   * @param xyoPacker a packer for serializing / deserializing values
   * @param originBlocksStorageProvider A storage provider for storage management
   */

  constructor(
    private readonly xyoPacker: XyoPacker,
    private readonly originBlocksStorageProvider: XYOStorageProvider,
    private readonly originBlockNextHashStorageProvider: XYOStorageProvider
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
    const blockDataValue = this.xyoPacker.serialize(originBlock, originBlock.major, originBlock.minor, false);
    const blockHashValue = this.xyoPacker.serialize(blockHash, blockHash.major, blockHash.minor, true);

    const previousHashes = await new XyoOriginBlock(this.xyoPacker, originBlock).findPreviousBlocks();
    const promises = previousHashes.map((hash) => {
      if (!hash) {
        return;
      }

      return this.originBlockNextHashStorageProvider.write(
        hash,
        blockHashValue,
        XyoStorageProviderPriority.PRIORITY_MED,
        true,
        60000
      );
    });

    await Promise.all(promises);

    await this.originBlocksStorageProvider.write(
      blockHashValue,
      blockDataValue,
      XyoStorageProviderPriority.PRIORITY_MED,
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

      const serializer = this.xyoPacker.getSerializerByDescriptor(XyoBoundWitness);
      const boundWitness = serializer.deserialize(result, this.xyoPacker);
      return boundWitness;
    } catch (err) {
      return undefined;
    }
  }
}
