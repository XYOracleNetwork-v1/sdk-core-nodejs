/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable @typescript-eslint/member-delimiter-style */
export interface IXyoOriginBlockRepository {
  removeOriginBlock(hash: Buffer): Promise<void>
  addOriginBlock(hash: Buffer, block: Buffer): Promise<void>
  addOriginBlocks(hashes: Buffer, blocks: Buffer): Promise<void>
}

export interface IXyoOriginBlockGetter {
  initialize(): Promise<boolean>

  getOriginBlock(hash: Buffer): Promise<Buffer | undefined>
  getOriginBlocks(
    limit?: number,
    offset?: Buffer
  ): Promise<{ items: Buffer[]; total: number }>
}

export interface IXyoBlockByPublicKeyRepository {
  getOriginBlocksByPublicKey(
    publicKey: Buffer,
    index: number | undefined,
    limit: number | undefined,
    up: boolean
  ): Promise<{ items: Buffer[]; total: number }>
}

export interface IXyoBlocksByGeohashRepository {
  getOriginBlocksByGeohash(geohash: string, limit: number): Promise<Buffer[]>
}

export interface IXyoBlocksByTime {
  getOriginBlocksByTime(
    fromTime: number,
    limit: number
  ): Promise<{ items: Buffer[]; lastTime: number }>
}
