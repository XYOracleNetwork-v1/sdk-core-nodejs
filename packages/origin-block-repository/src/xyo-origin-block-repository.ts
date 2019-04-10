/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 1:56:39 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-block-repository.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th February 2019 10:20:08 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoStorageProvider, IXyoIterableStorageProvider } from '@xyo-network/storage'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoOriginBlockRepository, IOriginBlockQueryResult } from './@types'
import { IXyoHash, IXyoHashProvider } from '@xyo-network/hashing'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'
import { XyoBridgeHashSet } from '@xyo-network/origin-chain'

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
    private readonly serializationService: IXyoSerializationService,
    private readonly hashingProvider: IXyoHashProvider
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
      const blocks = result.items.map((keyPair) => {
        return this.serializationService.deserialize(keyPair.value).hydrate<IXyoBoundWitness>()
      })

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
    const blockDataValue = originBlock.serialize()
    const blockHashValue = blockHash.serialize()

    await this.originBlocksStorageProvider.write(blockHashValue, blockDataValue)
  }

  public async getOriginBlockByHash(hash: Buffer): Promise<IXyoBoundWitness | undefined> {
    try {
      const result = await this.originBlocksStorageProvider.read(hash)
      if (!result) {
        return undefined
      }

      return this.serializationService.deserialize(result).hydrate<IXyoBoundWitness>()
    } catch (error) {
      // there was an error getting the key, so return undefined
      return undefined
    }
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise<{[h: string]: IXyoBoundWitness}>  {
    const dest: IXyoBoundWitness[] = []
    await this.recursivelyGetAllBlocksThatProvideAttribution(hash, undefined, dest)

    // This is going to be horribly slow
    return dest.reduce(async (promiseChain: Promise<{[h: string]: IXyoBoundWitness}>, result) => {
      const memo = await promiseChain
      const h = await this.hashingProvider.createHash(result.getSigningData())
      memo[h.serializeHex()] = result
      return memo
    }, Promise.resolve({}))
  }

  private async recursivelyGetAllBlocksThatProvideAttribution(
    hash: Buffer,
    currentCursor: Buffer | undefined,
    dest: IXyoBoundWitness[]
  ): Promise<void> {
    const results = await this.getOriginBlocks(1000, currentCursor)
    const matches = results.list.filter((bw) => {
      bw.parties.some((party) => {
        const bridgeSet = party.getHeuristic<XyoBridgeHashSet>(schema.bridgeHashSet.id)
        if (!bridgeSet) {
          return false
        }

        return bridgeSet.hashSet.some(hs => hs.serialize().equals(hash))
      })
    })

    dest.push(...matches)
    if (!results.hasNextPage) {
      return
    }

    const lastItem = results.list[results.list.length - 1]
    const lastHash = await this.hashingProvider.createHash(lastItem.getSigningData())

    return this.recursivelyGetAllBlocksThatProvideAttribution(
      hash,
      lastHash.serialize(),
      dest
    )
  }
}

function instanceOfIterableStorageProvider(storageProvider: IXyoStorageProvider):
  storageProvider is IXyoIterableStorageProvider {
  return 'iterate' in storageProvider
}
