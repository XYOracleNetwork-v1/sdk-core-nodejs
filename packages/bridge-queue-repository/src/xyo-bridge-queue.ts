
import { IXyoBridgeQueueItem, IXyoBridgeQueueRepository } from './'

export class XyoBridgeQueue {
  public sendLimit = 100
  public removeWeight = 3
  private repository: IXyoBridgeQueueRepository

  constructor (repo: IXyoBridgeQueueRepository) {
    this.repository = repo
  }

  public addQueueItem (hash: Buffer) {
    this.addQueueItemWithWeight(hash, 0)
  }

  public addQueueItemWithWeight (hash: Buffer, weight: number) {
    const item: IXyoBridgeQueueItem = {
      hash,
      weight
    }

    this.repository.addQueueItem(item)
  }

  public getBlocksToBridge (): IXyoBridgeQueueItem[] {
    return this.repository.getLowestWeight(this.sendLimit)
  }

  public onBlocksBridged (blocks: IXyoBridgeQueueItem[]) {
    const hashes: Buffer[] = []

    blocks.forEach((block) => {
      hashes.push(block.hash)
    })

    this.repository.incrementWeights(hashes)
  }

  public getBlocksToRemove (): Buffer[] {
    const blocks = this.repository.getQueue()
    const toRemoveHashes: Buffer[] = []

    blocks.forEach((block) => {
      if (block.weight >= this.removeWeight) {
        toRemoveHashes.push(block.hash)
      }
    })

    this.repository.removeHashes(toRemoveHashes)

    return toRemoveHashes
  }

}
