
import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoBoundWitnessOption } from '@xyo-network/peer-interaction'
import { IXyoSerializableObject } from '@xyo-network/serialization'
import { XyoBridgeQueue } from './xyo-bridge-queue'
import { serializer } from '@xyo-network/serializer'
import { IXyoBridgeQueueItem } from './'
import { XyoBridgeHashSet, XyoBridgeBlockSet } from '@xyo-network/origin-chain'
import { IXyoHash, IXyoHashProvider } from '@xyo-network/hashing'
import { XyoBoundWitness, IXyoBoundWitness } from '@xyo-network/bound-witness'

export class XyoBridgeOption implements IXyoBoundWitnessOption {
  private blocksInTransit: IXyoBridgeQueueItem[] = []
  private blockRepo: IXyoOriginBlockRepository
  private bridgeQueue: XyoBridgeQueue
  private hasher: IXyoHashProvider

  constructor (blocks: IXyoOriginBlockRepository, bridge: XyoBridgeQueue, hasher: IXyoHashProvider) {
    this.blockRepo = blocks
    this.bridgeQueue = bridge
    this.hasher = hasher
  }

  public async signed(): Promise<IXyoSerializableObject | null> {
    this.blocksInTransit = this.bridgeQueue.getBlocksToBridge()
    const hashes: IXyoHash[] = []

    for (let i = 0; i <= this.blocksInTransit.length - 1; i++) {
      try {
        const block = this.blocksInTransit[i]
        const boundWitness = await this.blockRepo.getOriginBlockByHash(block.hash)

        if (boundWitness) {
          const hash = await this.hasher.createHash(boundWitness.getSigningData())
          hashes.push(hash)
        }
      } catch (e) {
        console.log(`Missing origin block ${this.blocksInTransit[i].hash.toString("hex")}`)
      }

    }

    return new XyoBridgeHashSet(hashes)
  }

  public async unsigned(): Promise < IXyoSerializableObject | null > {
    const blocks: IXyoBoundWitness[] = []

    for (let i = 0; i <= this.blocksInTransit.length - 1; i++) {
      try {
        const block = this.blocksInTransit[i]
        const boundWitness = await this.blockRepo.getOriginBlockByHash(block.hash)

        if (boundWitness) {
          blocks.push(boundWitness)
        }
      } catch (error) {
        console.log(`Missing origin block ${this.blocksInTransit[i].hash.toString("hex")}`)
      }
    }

    return new XyoBridgeBlockSet(blocks)
  }

  public onCompleted () {
    this.bridgeQueue.onBlocksBridged(this.blocksInTransit)
  }

}
