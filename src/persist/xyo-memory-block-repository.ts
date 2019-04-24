import { IXyoOriginBlockRepository } from './xyo-origin-block-repository'
import { XyoIterableStructure } from '@xyo-network/object-model'
import { XyoBoundWitness } from '../bound-witness'
import { IXyoHasher } from '../hashing'

export class XyoMemoryBlockRepository implements IXyoOriginBlockRepository {
  private hasher: IXyoHasher
  private blockMapping: Map<string, Buffer> = new Map()

  constructor(hasher: IXyoHasher) {
    this.hasher = hasher
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    this.blockMapping.delete(hash.toString('base64'))
  }

  public async addOriginBlock(block: Buffer): Promise<void> {
    const boundWitness = new XyoBoundWitness(block)
    const hash = boundWitness.getHash(this.hasher).getAll().getContentsCopy()
    this.blockMapping.set(hash.toString('base64'), block)
  }

  public async getOriginBlock(hash: Buffer): Promise<Buffer | undefined> {
    return this.blockMapping.get(hash.toString('base64'))
  }

  public async addOriginBlocks(blocks: Buffer): Promise<void> {
    const structure = new XyoIterableStructure(blocks)
    const blockIt = structure.newIterator()

    while (blockIt.hasNext()) {
      const block = blockIt.next()
      this.addOriginBlock(block.value.getAll().getContentsCopy())
    }
  }

  public async getOriginBlocks(limit?: number, offset?: Buffer): Promise<Buffer[]> {
    throw new Error('Not implemented')
  }
}
