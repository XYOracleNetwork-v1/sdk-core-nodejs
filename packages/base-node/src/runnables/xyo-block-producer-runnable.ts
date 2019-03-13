/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 4th March 2019 1:36:37 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-producer-runnable.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 5th March 2019 11:38:34 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoRunnable, providerFn } from "@xyo-network/utils"
import { XyoBlockProducer } from "@xyo-network/block-producer"

export class XyoBlockProducerRunnable extends XyoBase implements IXyoRunnable {
  public readonly type = "daemon"
  private blockProducer: XyoBlockProducer | undefined
  private daemonStarted = false

  constructor(private readonly blockProducerProvider: providerFn<XyoBlockProducer>) {
    super()
  }

  public async initialize(): Promise<void> {
    this.logInfo(`BlockProducer daemon started`)
    this.blockProducer = await this.blockProducerProvider()
  }

  public async run(): Promise<void> {
    if (!this.blockProducer) {
      this.blockProducer = await this.blockProducerProvider()
    }

    this.daemonStarted = true
    return this.blockProducer.start()
  }

  public async stop(): Promise<void> {
    if (!this.daemonStarted || !this.blockProducer) return
    await this.blockProducer.stop()
  }

}
