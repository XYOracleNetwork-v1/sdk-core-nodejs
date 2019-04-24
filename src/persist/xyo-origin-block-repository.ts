
export interface IXyoOriginBlockRepository {
  removeOriginBlock(hash: Buffer): Promise<void>
  addOriginBlock(hash: Buffer, originBlock: Buffer): Promise<void>
  addOriginBlocks(originBlocks: Buffer): Promise<void>
  getOriginBlock(hash: Buffer): Promise<Buffer | undefined>
  getOriginBlocks(limit?: number, offset?: Buffer): Promise<Buffer[]>
}
