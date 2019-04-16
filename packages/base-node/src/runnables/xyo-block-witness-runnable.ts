/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Monday, 4th March 2019 1:36:37 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-witness-runnable.ts
 
 * @Last modified time: Wednesday, 13th March 2019 4:01:27 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoRunnable, providerFn } from "@xyo-network/utils"
import { XyoBlockWitness } from "@xyo-network/block-witness"

export class XyoBlockWitnessRunnable extends XyoBase implements IXyoRunnable {

  public readonly type = "daemon"
  private blockWitness: XyoBlockWitness | undefined
  private daemonStarted = false

  constructor(private readonly blockWitnessProvider: providerFn<XyoBlockWitness>) {
    super()
  }

  public getSleepTime(): number {
    return 1000
  }

  public async initialize(): Promise<void> {
    this.logInfo(`BlockWitness daemon started`)
    this.blockWitness = await this.blockWitnessProvider()
  }

  public async run(): Promise<void> {
    if (!this.blockWitness) {
      this.blockWitness = await this.blockWitnessProvider()
    }

    this.daemonStarted = true
    return this.blockWitness.start()
  }

  public async stop(): Promise<void> {
    if (!this.daemonStarted || !this.blockWitness) return
    await this.blockWitness.stop()
  }

}
