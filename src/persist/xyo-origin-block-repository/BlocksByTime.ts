/*
 * File: xyo-origin-block-repository copy 3.ts
 * Project: @xyo-network/sdk-core-nodejs
 * File Created: Friday, 13th November 2020 12:50:25 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 12:53:30 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2020 XY - The Persistent Company
 */

abstract class XyoBlocksByTime {
  abstract getOriginBlocksByTime(
    fromTime: number,
    limit: number
  ): Promise<{ items: Buffer[]; lastTime: number }>
}

export default XyoBlocksByTime
