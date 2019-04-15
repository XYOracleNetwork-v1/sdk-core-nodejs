/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 22nd February 2019 11:43:26 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-producer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 12th March 2019 2:30:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:prefer-template

import { XyoError } from '@xyo-network/errors'
import { IXyoHashProvider } from '@xyo-network/hashing'
import { IXyoTransactionRepository } from '@xyo-network/transaction-pool'
import { XyoDaemon, unsubscribeFn, BN } from '@xyo-network/utils'
import {
  IConsensusProvider,
  ISignatureComponents,
} from '@xyo-network/consensus'
import { IXyoIntersectionTransaction } from '@xyo-network/questions'
import {
  IXyoNodeNetwork,
  IBlockWitnessRequestDTO,
} from '@xyo-network/node-network'
import { XyoBase } from '@xyo-network/base'
import { IXyoContentAddressableService } from '@xyo-network/content-addressable-service'
import { XyoBlockWitnessValidator } from '@xyo-network/block-witness'

const MAX_TRANSACTIONS = 10
const MIN_TRANSACTIONS = 1
const MAX_BLOCK_PRODUCER_TRIES = 100

export class XyoBlockProducer extends XyoDaemon {
  private myTurnToSubmitBlock = false

  constructor(
    private readonly consensusProvider: IConsensusProvider,
    private readonly accountAddress: string,
    private readonly transactionRepository: IXyoTransactionRepository,
    private readonly hashProvider: IXyoHashProvider,
    private readonly nodeNetwork: IXyoNodeNetwork,
    private readonly contentService: IXyoContentAddressableService,
    private readonly blockWitnessValidator: XyoBlockWitnessValidator,
  ) {
    super()
  }

  public run() {
    return this.tryProduceBlock()
  }

  private async tryProduceBlock(): Promise<void> {
    const canSubmit = await this.consensusProvider.canSubmitBlock(
      this.accountAddress,
    )
    if (!canSubmit) {
      if (this.myTurnToSubmitBlock) {
        this.logInfo(`Unable to compose a block in window`)
      }
      this.myTurnToSubmitBlock = false
      return
    }

    this.myTurnToSubmitBlock = true
    this.logInfo(`Its my turn to submit a block 🤑`)
    return this.tryBuildBlock()
  }

  private async tryBuildBlock(): Promise<void> {
    const list = await this.consensusProvider.getNextUnhandledRequests()

    if (Object.keys(list).length < MIN_TRANSACTIONS) {
      this.logInfo(
        'There are ' +
          Object.keys(list).length +
          ' transactions in the transaction pool, ' +
          'which is not enough transactions to process',
      )
      return
    }

    const latestBlockHash = await this.consensusProvider.getLatestBlockHash()
    // console.log('XyoBlockProducer: latestBlockHash', latestBlockHash)
    const currentBlockHeight = await this.consensusProvider.getBlockHeight()
    const trustThreshold = await this.consensusProvider.getBlockConfirmationTrustThreshold()

    let stakeConsensusBlockHeight = currentBlockHeight.sub(
      new BN(trustThreshold),
    )

    if (stakeConsensusBlockHeight.lte(new BN(15))) {
      stakeConsensusBlockHeight = new BN(15)
    }

    const candidate = await Object.keys(list).reduce(
      async (m, transactionKey) => {
        const memo = await m
        const transaction = await this.transactionRepository.find(
          transactionKey,
        )
        if (
          !transaction ||
          transaction.transactionType !== 'request-response'
        ) {
          return memo
        }

        const intersection = transaction as IXyoIntersectionTransaction
        const requestId = intersection.data.request.id
        memo.requests.push(requestId)
        memo.responses = Buffer.concat([
          memo.responses,
          intersection.data.answer ? Buffer.from([0x01]) : Buffer.from([0x00]),
        ])

        memo.supportingData.push(intersection.data.response)
        return memo
      },
      Promise.resolve({
        previousBlockHash: latestBlockHash,
        requests: [] as string[],
        responses: Buffer.alloc(0),
        supportingData: [] as any[],
      }),
    )

    if (candidate.requests.length === 0) {
      this.logInfo('No responses for questions in transaction pool, continuing')
      return
    }

    const jsonSupportDataBuf = Buffer.from(
      JSON.stringify(candidate.supportingData),
    )
    let supportingDataHash = ''

    try {
      supportingDataHash = await this.contentService.add(jsonSupportDataBuf)
      this.logInfo(
        `Uploaded supporting data value with content address ${supportingDataHash}`,
      )
    } catch (e) {
      this.logError(`Error uploading supporting data, cannot continue`, e)
      return
    }

    const blockHash = await this.consensusProvider.encodeBlock(
      latestBlockHash,
      stakeConsensusBlockHeight,
      candidate.requests,
      supportingDataHash,
      candidate.responses,
    )

    try {
      const validates = await this.blockWitnessValidator.validate(
        blockHash,
        stakeConsensusBlockHeight,
        latestBlockHash,
        supportingDataHash,
        candidate.requests,
        candidate.responses,
      )

      if (!validates) throw new XyoError(`Could not validate block candidate`)
    } catch (e) {
      this.logError(`Could not validate block candidate`, e)
      return
    }

    this.logInfo('GOT THE ENCODED BLOCK', blockHash)

    const quorum = await this.consensusProvider.getStakeQuorumPct()
    const networkActiveStake = await this.consensusProvider.getNetworkActiveStake()
    const target = networkActiveStake.mul(new BN(quorum)).div(new BN(100))

    if (target.lte(new BN(0))) {
      throw new XyoError(`Unknown state where target stake is lte to 0`)
    }

    // tslint:disable-next-line:prefer-array-literal
    const sigAccumulator: Array<{
      pk: string
      r: string
      s: string
      v: number
    }> = []
    let totalStakeAccumulated = new BN(0)

    const mySig = await this.consensusProvider.signBlock(blockHash)

    const activeStake =
      (await this.consensusProvider.getActiveStake(mySig.publicKey)) ||
      new BN(0)
    totalStakeAccumulated = totalStakeAccumulated.add(activeStake)
    if (activeStake.gt(new BN(0))) {
      sigAccumulator.push({
        pk: mySig.publicKey,
        r: mySig.sigR,
        s: mySig.sigS,
        v: mySig.sigV,
      })
    }

    if (totalStakeAccumulated.gte(target)) {
      await this.submitBlock(
        sigAccumulator,
        mySig,
        stakeConsensusBlockHeight,
        latestBlockHash,
        supportingDataHash,
        candidate.requests,
        candidate.responses,
      )
      return
    }

    return new Promise(async (resolve, reject) => {
      const dto: IBlockWitnessRequestDTO = {
        blockHash,
        supportingDataHash,
        previousBlockHash: latestBlockHash,
        requests: candidate.requests,
        responses: candidate.responses.toString('hex'),
        agreedStakeBlockHeight: stakeConsensusBlockHeight.toString(16),
      }

      let unsubscribe:
        | unsubscribeFn
        | undefined = this.nodeNetwork.requestSignaturesForBlockCandidate(
        dto,
        this.onSignatureRequest(
          target,
          (v: BN) => {
            totalStakeAccumulated = totalStakeAccumulated.add(v)
            return totalStakeAccumulated
          },
          (pk, sig) => {
            sigAccumulator.push({
              pk,
              r: sig.r,
              s: sig.s,
              v: sig.v,
            })
          },
          () => {
            if (unsubscribe) {
              unsubscribe()
              unsubscribe = undefined
            } else {
              // if already unsubscribed, dont submit block
              return resolve()
            }

            this.submitBlock(
              sigAccumulator,
              mySig,
              stakeConsensusBlockHeight,
              latestBlockHash,
              supportingDataHash,
              candidate.requests,
              candidate.responses,
            )
              .then(() => resolve())
              .catch(reject)
          },
        ),
      )

      const cancelLoop = async (tries: number) => {
        this.logInfo(
          `Still working on producing block after ${1000 * tries} seconds`,
        )
        if (unsubscribe === undefined) {
          unscheduleTimeout()
          resolve()
          return
        }

        if (this.shouldStop()) {
          unsubscribe()
          unscheduleTimeout()
          resolve()
          return
        }

        const [stillCanSubmit, currentLatestBlockHash] = await Promise.all([
          this.consensusProvider.canSubmitBlock(this.accountAddress),
          this.consensusProvider.getLatestBlockHash(),
        ])

        if (
          !stillCanSubmit ||
          currentLatestBlockHash !== latestBlockHash ||
          tries >= MAX_BLOCK_PRODUCER_TRIES
        ) {
          if (unsubscribe) {
            unsubscribe()
            unsubscribe = undefined
          }

          unscheduleTimeout()
          resolve()
          return
        }

        unscheduleTimeout = XyoBase.timeout(() => cancelLoop(tries + 1), 1000)
      }

      let unscheduleTimeout = XyoBase.timeout(() => cancelLoop(1), 1000)
    })
  }

  private async submitBlock(
    sigAccumulator: { pk: string; r: string; s: string; v: number }[], // tslint:disable-line:array-type
    mySig: ISignatureComponents,
    stakeConsensusBlockHeight: BN,
    latestBlockHash: string,
    supportingDataHash: string,
    requests: string[],
    responses: Buffer,
  ) {
    sigAccumulator.sort((a, b) => a.pk.localeCompare(b.pk))
    const stillCanSubmit = await this.consensusProvider.canSubmitBlock(
      this.accountAddress,
    )
    const currentLatestBlockHash = await this.consensusProvider.getLatestBlockHash()

    if (!stillCanSubmit || currentLatestBlockHash !== latestBlockHash) {
      return
    }

    return this.consensusProvider.submitBlock(
      latestBlockHash,
      stakeConsensusBlockHeight,
      requests,
      supportingDataHash,
      responses,
      sigAccumulator.map(s => s.pk),
      sigAccumulator.map(s => s.r),
      sigAccumulator.map(s => s.s),
      sigAccumulator.map(s => s.v),
    )
  }

  private onSignatureRequest(
    target: BN,
    addToStake: (v: BN) => BN,
    addSig: (
      publicKey: string,
      sig: { r: string; s: string; v: number },
    ) => void,
    onQuorumReached: () => void,
  ) {
    let resolved = false

    return async (
      publicKey: string,
      sigComponents: {
        r: string
        s: string
        v: number
      },
    ) => {
      if (resolved) return
      const activeStake =
        (await this.consensusProvider.getActiveStake(publicKey)) || new BN(0)
      if (resolved || activeStake.eq(new BN(0))) return

      const newStake = addToStake(activeStake)

      if (activeStake.gt(new BN(0))) {
        addSig(publicKey, sigComponents)
      }

      if (newStake.gte(target)) {
        resolved = true
        onQuorumReached()
      }
    }
  }
}
