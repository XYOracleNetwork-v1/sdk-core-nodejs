/*
 * File: xyo-origin-block-repository copy 3.ts
 * Project: @xyo-network/sdk-core-nodejs
 * File Created: Friday, 13th November 2020 12:50:25 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 12:53:40 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2020 XY - The Persistent Company
 */

abstract class XyoOriginBlockGetter {
  abstract initialize(): Promise<boolean>

  abstract getOriginBlock(hash: Buffer): Promise<Buffer | undefined>
  abstract getOriginBlocks(
    limit?: number,
    offset?: Buffer
  ): Promise<{ items: Buffer[]; total: number }>
}

export default XyoOriginBlockGetter
