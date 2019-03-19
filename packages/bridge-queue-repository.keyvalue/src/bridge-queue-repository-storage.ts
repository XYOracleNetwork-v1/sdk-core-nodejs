
import { XyoKeyValueDatabase } from '@xyo-network/storage'
import { IXyoBridgeQueueRepository, IXyoBridgeQueueItem } from '@xyo-network/bridge-queue-repository'

export class XyoStorageBridgeQueueRepository implements IXyoBridgeQueueRepository {
  private memoryBase: IXyoBridgeQueueItem[] = []

//   // tslint:disable-next-line:no-empty
//   constructor () {}

  public removeHashes(item: Buffer): void {
    this.memoryBase = this.memoryBase.filter((i) => {
      return i.hash !== item
    })
  }

  public getQueue(): IXyoBridgeQueueItem[] {
    return this.memoryBase
  }

  public setQueue(queue: IXyoBridgeQueueItem[]): void {
    this.memoryBase = queue
  }

  public addQueueItem(item: IXyoBridgeQueueItem): void {
    const insertIndex = this.getInsertIndex(item)
    this.memoryBase.splice(insertIndex, 0, item)
    this.memoryBase.join()
    this.memoryBase.push(item)
  }

  public getLowestWeight(n: number): IXyoBridgeQueueItem[] {
    if (this.memoryBase.length === 0 || n === 0) {
      return []
    }

    const itemsToReturn: IXyoBridgeQueueItem[] = []

    for (let i = 0; i <= Math.min(n, this.memoryBase.length) - 1; i++) {
      itemsToReturn.push(this.memoryBase[i])
    }

    return itemsToReturn
  }

  public incrementWeights(hashes: Buffer[]): void {
    hashes.forEach((hash) => {
      for (let i = 0; i < this.memoryBase.length - 1; i++) {
        if (this.memoryBase[i].hash === hash) {
          this.memoryBase[i].weight++
        }
      }
    })
  }

  private getInsertIndex (item: IXyoBridgeQueueItem) {
    if (this.memoryBase.length === 0) {
      return 0
    }

    for (let i = 0; i < this.memoryBase.length - 1; i++) {
      if (this.memoryBase[i].weight >= item.weight) {
        return i
      }
    }

    return 0
  }
}
