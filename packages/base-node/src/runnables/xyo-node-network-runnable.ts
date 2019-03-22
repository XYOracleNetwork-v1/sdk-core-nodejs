/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 4th March 2019 1:20:12 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-network-runnable.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th March 2019 4:01:58 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoRunnable, providerFn } from "@xyo-network/utils"
import { IXyoNodeNetwork } from "@xyo-network/node-network"

export class XyoNodeNetworkRunnable extends XyoBase implements IXyoRunnable {

  public readonly type = "daemon"
  public nodeNetwork: IXyoNodeNetwork | undefined

  constructor (private readonly nodeNetworkProvider: providerFn<IXyoNodeNetwork>) {
    super()
  }

  public getSleepTime(): number {
    return 1000 // doesn't sleep ever
  }

  public async initialize(): Promise<void> {
    this.logInfo(`Initializing XyoNodeNetworkRunnable daemon`)
  }

  public async run(): Promise<void> {
    this.nodeNetwork = await this.nodeNetworkProvider()
  }

  public async stop(): Promise<void> {
    // TODO add graceful shutdown for node network
  }
}
