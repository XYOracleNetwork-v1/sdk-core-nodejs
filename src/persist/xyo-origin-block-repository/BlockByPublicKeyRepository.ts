/*
 * File: xyo-origin-block-repository copy 4.ts
 * Project: @xyo-network/sdk-core-nodejs
 * File Created: Friday, 13th November 2020 12:50:26 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 12:52:30 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2020 XY - The Persistent Company
 */

abstract class XyoBlockByPublicKeyRepository {
  abstract getOriginBlocksByPublicKey(
    publicKey: Buffer,
    index: number | undefined,
    limit: number | undefined,
    up: boolean
  ): Promise<{ items: Buffer[]; total: number }>
}

export default XyoBlockByPublicKeyRepository
