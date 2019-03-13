/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 4th March 2019 1:36:37 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-witness-runnable.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 5th March 2019 11:38:41 am
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
