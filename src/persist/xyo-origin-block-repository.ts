
export interface IXyoOriginBlockRepository {
  removeOriginBlock(hash: Buffer): Promise<void>
  addOriginBlock(block: Buffer): Promise<void>
  addOriginBlocks(blocks: Buffer): Promise<void>
  getOriginBlock(hash: Buffer): Promise<Buffer | undefined>
  getOriginBlocks(limit?: number, offset?: Buffer): Promise<Buffer[]>
}
