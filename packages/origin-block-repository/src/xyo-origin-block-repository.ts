/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 1:56:39 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-block-repository.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 21st November 2018 4:01:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoStoragePriority, IXyoStorageProvider, IXyoIterableStorageProvider } from '@xyo-network/storage'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoOriginBlockRepository, IOriginBlockQueryResult } from './@types'
import { IXyoHash } from '@xyo-network/hashing'
import { IXyoTypeSerializer } from '@xyo-network/serialization'

/**
 * An XyoOriginChainNavigator exposes an api for managing
 * an origin chain
 */

export class XyoOriginBlockRepository implements IXyoOriginBlockRepository {

  /**
   * Creates an instance of a XyoOriginChainNavigator
   *
   * @param originBlocksStorageProvider A storage provider for storage management
   */

  constructor(
    private readonly originBlocksStorageProvider: IXyoStorageProvider,
    private readonly boundWitnessSerializer: IXyoTypeSerializer<IXyoBoundWitness>,
    private readonly hashSerializer: IXyoTypeSerializer<IXyoHash>,
  ) {}

  /**
   * Removes an origin block from storage if it exists
   *
   * @param originBlockHash The hash of the origin block to remove
   */

  public async removeOriginBlock(originBlockHash: Buffer) {
    return this.originBlocksStorageProvider.delete(originBlockHash)
  }

  /**
   * Returns true if the block exists in storage corresponding to the hash, false otherwise
   * @param originBlockHash The hash of the block to query
   */

  public async containsOriginBlock (originBlockHash: Buffer) {
    return this.originBlocksStorageProvider.containsKey(originBlockHash)
  }

  public async getOriginBlocks(limit: number, offsetHash?: Buffer): Promise<IOriginBlockQueryResult> {
    const hashes = await this.getAllOriginBlockHashes()

    // If this is an iterable storage-provider, answer question that way
    if (instanceOfIterableStorageProvider(this.originBlocksStorageProvider)) {
      const result = await this.originBlocksStorageProvider.iterate({ limit, offsetKey: offsetHash })
      const blocks = result.items.map(keyPair => this.boundWitnessSerializer.deserialize(keyPair.value))

      return {
        list: blocks,
        totalSize: hashes.length,
        hasNextPage: result.hasMoreItems
      }
    }

    const offsetIndex = offsetHash ? hashes.findIndex(hash => hash.equals(offsetHash)) : 0

    if (offsetIndex === -1) {
      return {
        list: [],
        totalSize: hashes.length,
        hasNextPage: false
      }
    }

    const promises: Array<Promise<IXyoBoundWitness>> = [] // tslint:disable-line:prefer-array-literal
    let index = 0

    while (index < limit && ((index + offsetIndex) < hashes.length)) {
      promises.push(
        this.getOriginBlockByHash(hashes[index + offsetIndex]) as Promise<IXyoBoundWitness>
      )
      index += 1
    }

    const boundWitnesses = await Promise.all(promises)
    return {
      list: boundWitnesses,
      totalSize: hashes.length,
      hasNextPage: (index + offsetIndex) < hashes.length
    }
  }

  /**
   * Returns a list of all of origin blocks in the system
   */
  public async getAllOriginBlockHashes() {
    return this.originBlocksStorageProvider.getAllKeys()
  }

  /**
   * Adds a bound-witness, which is an origin block, to storage. Additionally it updates
   * any indexes that need to be updated
   */

  public async addOriginBlock(blockHash: IXyoHash, originBlock: IXyoBoundWitness): Promise<void> {
    const blockDataValue = this.boundWitnessSerializer.serialize(originBlock, 'buffer') as Buffer
    const blockHashValue = this.hashSerializer.serialize(blockHash, 'buffer') as Buffer

    await this.originBlocksStorageProvider.write(
      blockHashValue,
      blockDataValue,
      XyoStoragePriority.PRIORITY_MED,
      true,
      60000
    )
  }

  public async getOriginBlockByHash(hash: Buffer): Promise<IXyoBoundWitness | undefined> {
    try {
      const result = await this.originBlocksStorageProvider.read(hash, 60000)
      if (!result) {
        return undefined
      }

      return this.boundWitnessSerializer.deserialize(result)
    } catch (err) {
      return undefined
    }
  }
}

function instanceOfIterableStorageProvider(storageProvider: IXyoStorageProvider):
  storageProvider is IXyoIterableStorageProvider {
  return 'iterate' in storageProvider
}