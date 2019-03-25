
export { XyoBridgeQueue } from './xyo-bridge-queue'
export { XyoBridgeOption } from './xyo-bridge-option'

export interface IXyoBridgeQueueRepository {
  removeHashes(items: Buffer[]): void
  getQueue(): IXyoBridgeQueueItem[]
  setQueue (queue: IXyoBridgeQueueItem[]): void
  addQueueItem (item: IXyoBridgeQueueItem): void
  getLowestWeight (n: number): IXyoBridgeQueueItem[]
  incrementWeights (hashes: Buffer[]): void
  commit (): Promise<void>
  restore (): Promise<void>
}

export interface IXyoBridgeQueueItem {
  hash: Buffer
  weight: number
}
