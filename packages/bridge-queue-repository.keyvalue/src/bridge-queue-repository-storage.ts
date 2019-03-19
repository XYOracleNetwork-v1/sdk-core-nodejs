
import { IXyoStorageProvider } from '@xyo-network/storage'
import { IXyoBridgeQueueRepository, IXyoBridgeQueueItem } from '@xyo-network/bridge-queue-repository'

export class XyoStorageBridgeQueueRepository implements IXyoBridgeQueueRepository {
  private static QUEUE_KEY = Buffer.from("BRIDGE_QUEUE")
  private memoryBase: IXyoBridgeQueueItem[] = []
  private storage: IXyoStorageProvider

  constructor (store: IXyoStorageProvider) {
    this.storage = store
  }

  public removeHashes(items: Buffer[]): void {
    items.forEach((hash) => {
      this.removeHash(hash)
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

  public async commit () {
    await this.storage.write(
        XyoStorageBridgeQueueRepository.QUEUE_KEY,
        Buffer.from(JSON.stringify(this.memoryBase))
    )
  }

  public async restore () {
    const encodedState = await this.storage.read(XyoStorageBridgeQueueRepository.QUEUE_KEY)

    if (encodedState) {
      const string = encodedState.toString("utf8")
      this.memoryBase = JSON.parse(string)
    }
  }

  private removeHash (hash: Buffer) {
    this.memoryBase = this.memoryBase.filter((i) => {
      return i.hash !== hash
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
