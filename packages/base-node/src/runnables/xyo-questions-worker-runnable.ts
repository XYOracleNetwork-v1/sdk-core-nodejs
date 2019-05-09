/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 4th March 2019 1:27:37 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-questions-worker-runnable.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th March 2019 4:03:03 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoRunnable, providerFn } from "@xyo-network/utils"
import { QuestionsWorker } from "@xyo-network/questions"

export class XyoQuestionsWorkerRunnable extends XyoBase implements IXyoRunnable {
  public readonly type = "loop"
  private questionWorker: QuestionsWorker | undefined

  constructor(private readonly questionWorkerProvider: providerFn<QuestionsWorker>) {
    super()
  }

  public getSleepTime(): number {
    return 500
  }

  public async initialize(): Promise<void> {
    this.logInfo(`Starting QuestionsWorker daemon`)
    this.questionWorker = await this.questionWorkerProvider()
  }

  public async run(): Promise<void> {
    if (!this.questionWorker) {
      this.questionWorker = await this.questionWorkerProvider()
    }

    await this.questionWorker.run()
  }

  public async stop(): Promise<void> {
    if (!this.questionWorker) return
  }
}
