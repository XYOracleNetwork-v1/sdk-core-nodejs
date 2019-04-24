
export interface IXyoOriginBlockRepository {
  removeOriginBlock(hash: Buffer): Promise<void>
  addOriginBlock(hash: Buffer, block: Buffer): Promise<void>
  addOriginBlocks(hashes: Buffer, blocks: Buffer): Promise<void>
  getOriginBlock(hash: Buffer): Promise<Buffer | undefined>
  getOriginBlocks(limit?: number, offset?: Buffer): Promise<Buffer[]>
}
