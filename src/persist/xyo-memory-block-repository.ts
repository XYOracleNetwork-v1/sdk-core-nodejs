import { XyoIterableStructure } from '../object-model'
import {
  XyoOriginBlockGetter,
  XyoOriginBlockRepository,
} from './xyo-origin-block-repository'

export class XyoMemoryBlockRepository
  implements XyoOriginBlockRepository, XyoOriginBlockGetter {
  private blockMapping: Map<string, Buffer> = new Map()

  // eslint-disable-next-line require-await
  public async initialize(): Promise<boolean> {
    return true
  }

  // eslint-disable-next-line require-await
  public async removeOriginBlock(hash: Buffer): Promise<void> {
    this.blockMapping.delete(hash.toString('base64'))
  }

  // eslint-disable-next-line require-await
  public async addOriginBlock(hash: Buffer, block: Buffer): Promise<void> {
    this.blockMapping.set(hash.toString('base64'), block)
  }

  // eslint-disable-next-line require-await
  public async getOriginBlock(hash: Buffer): Promise<Buffer | undefined> {
    return this.blockMapping.get(hash.toString('base64'))
  }

  // eslint-disable-next-line require-await
  public async addOriginBlocks(hashes: Buffer, blocks: Buffer): Promise<void> {
    const blockStructure = new XyoIterableStructure(blocks)
    const hashesStructure = new XyoIterableStructure(hashes)
    const blockIt = blockStructure.newIterator()
    const hashIt = hashesStructure.newIterator()

    while (blockIt.hasNext()) {
      const block = blockIt.next().value
      const hash = hashIt.next().value
      this.addOriginBlock(
        hash.getAll().getContentsCopy(),
        block.getAll().getContentsCopy()
      )
    }
  }

  // eslint-disable-next-line require-await
  public async getOriginBlocks(
    _limit?: number,
    _offset?: Buffer
  ): Promise<{ items: Buffer[]; total: number }> {
    throw new Error(
      'getOriginBlocks not implemented in XyoMemoryBlockRepository'
    )
  }
}
