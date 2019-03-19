export interface IXyoBridgeQueueRepository {
  removeHashes(item: Buffer): void
  getQueue(): IXyoBridgeQueueItem[]
  setQueue (queue: IXyoBridgeQueueItem[]): void
  addQueueItem (item: IXyoBridgeQueueItem): void
  getLowestWeight (n: number): IXyoBridgeQueueItem[]
  incrementWeights (hashes: Buffer[]): void
}

export interface IXyoBridgeQueueItem {
  hash: Buffer
  weight: number
}
