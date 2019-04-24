import { IXyoOriginBlockRepository } from './xyo-origin-block-repository'

export class XyoMemoryBlockRepository implements IXyoOriginBlockRepository {
  private blockMapping: Map<string, Buffer> = new Map()

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    this.blockMapping.delete(hash.toString('base64'))
  }

  public async addOriginBlock(hash: Buffer, originBlock: Buffer): Promise<void> {
    this.blockMapping.set(hash.toString('base64'), originBlock)
  }

  public async getOriginBlock(hash: Buffer): Promise<Buffer | undefined> {
    return this.blockMapping.get(hash.toString('base64'))
  }

  public async addOriginBlocks(originBlocks: Buffer): Promise<void> {
    throw new Error('Not implemented')
  }

  public async getOriginBlocks(limit?: number, offset?: Buffer): Promise<Buffer[]> {
    throw new Error('Not implemented')
  }
}
