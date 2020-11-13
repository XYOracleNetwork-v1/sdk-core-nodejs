/*
 * File: xyo-origin-block-repository copy 2.ts
 * Project: @xyo-network/sdk-core-nodejs
 * File Created: Friday, 13th November 2020 12:50:25 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 12:53:58 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2020 XY - The Persistent Company
 */

abstract class XyoOriginBlockRepository {
  abstract removeOriginBlock(hash: Buffer): Promise<void>
  abstract addOriginBlock(hash: Buffer, block: Buffer): Promise<void>
  abstract addOriginBlocks(hashes: Buffer, blocks: Buffer): Promise<void>
}

export default XyoOriginBlockRepository
