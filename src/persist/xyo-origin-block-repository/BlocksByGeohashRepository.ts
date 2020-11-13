/*
 * File: xyo-origin-block-repository copy.ts
 * Project: @xyo-network/sdk-core-nodejs
 * File Created: Friday, 13th November 2020 12:50:24 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 12:52:47 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2020 XY - The Persistent Company
 */

abstract class XyoBlocksByGeohashRepository {
  abstract getOriginBlocksByGeohash(
    geohash: string,
    limit: number
  ): Promise<Buffer[]>
}

export default XyoBlocksByGeohashRepository
