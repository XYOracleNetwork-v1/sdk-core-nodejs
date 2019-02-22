/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 22nd February 2019 11:43:26 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-producer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 22nd February 2019 1:58:12 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:prefer-template

import { XyoBase } from '@xyo-network/base'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoHash } from '@xyo-network/hashing'
import { IXyoTransaction } from '@xyo-network/transaction-pool'
import { IXyoRepository } from '@xyo-network/utils'
import { IConsensusProvider } from '@xyo-network/consensus'

const MAX_TRANSACTIONS = 10
const MIN_TRANSACTIONS = 1

export class XyoBlockProducer extends XyoBase {
  private resolveStopLoopingPromise: () => void | undefined
  private loopingPromise: Promise<IProducedBlock>
  private myTurnToSubmitBlock = false

  constructor(
    private readonly consensusProvider: IConsensusProvider,
    private readonly accountAddress: string,
    private readonly activeValidatedTransactions: IXyoRepository<IXyoHash, IXyoTransaction<any>>
  ) {
    super()
  }

  public async start(): Promise<IProducedBlock | undefined> {
    if (this.loopingPromise) throw new XyoError(`Already looping`, XyoErrors.CRITICAL)

    this.loopingPromise = new Promise(async (resolve, reject) => {
      let res: IProducedBlock | undefined
      try {
        res = await this.loop()
      } catch (err) {
        this.logError(`There was an error in the XyoBlockProducer loop`, err)
      }

      if (res) {
        this.loopingPromise = undefined
        resolve(res)
      }

      if (this.resolveStopLoopingPromise) {
        this.loopingPromise = undefined
        if (!res) resolve(undefined)

        setImmediate(() => {
          if (this.resolveStopLoopingPromise) this.resolveStopLoopingPromise()
          this.resolveStopLoopingPromise = undefined
        })
      } else if (!res) {
        setTimeout(() => this.loop(), 100)
      }
    }) as Promise<IProducedBlock | undefined>

    return this.loopingPromise
  }

  public async stop(): Promise<void> {
    if (!this.loopingPromise) throw new XyoError(`Not looping`, XyoErrors.CRITICAL)
    return new Promise((resolve) => {
      this.resolveStopLoopingPromise = resolve
    })
  }

  private async loop(): Promise<IProducedBlock | undefined> {
    const canSubmit = await this.consensusProvider.canSubmitBlock(this.accountAddress)
    if (!canSubmit) {
      if (this.myTurnToSubmitBlock) {
        this.logInfo(`Unable to compose a block in window`)
      }
      this.myTurnToSubmitBlock = false
      return
    }

    this.myTurnToSubmitBlock = true
    this.logInfo(`Its my turn to submit a block 🤑`)
    const list = await this.activeValidatedTransactions.list(MAX_TRANSACTIONS, undefined)

    if (list.meta.totalCount < MIN_TRANSACTIONS) {
      this.logInfo(
        'There are ' + list.meta.totalCount + 'transactions in the transaction pool, ' +
        'which is not enough transactions to process'
      ) // The loop will continue again in 100ms
      return
    }

    return undefined // TODO
  }
}

// tslint:disable-next-line:no-empty-interface
export interface IProducedBlock {

}
