/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 25th February 2019 10:15:15 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-scsc-consensus-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 25th February 2019 11:27:09 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IConsensusProvider, IRequest, ISignatureComponents, IResponse } from './@types'
import { BigNumber } from 'bignumber.js'
import { XyoBase } from '@xyo-network/base'
import { XyoWeb3Service } from '@xyo-network/web3-service'
import { unsubscribeFn } from '@xyo-network/utils'

export class XyoScscConsensusProvider extends XyoBase implements IConsensusProvider {
  private web3Service: XyoWeb3Service

  constructor(private readonly web3: XyoWeb3Service) {
    super()
    this.web3Service = web3
  }

  public async getRequestById(id: BigNumber): Promise<IRequest | undefined> {
    const consensus = await this.web3Service.getOrInitializeSCSC()
    return consensus.methods.requestsById(id).call()
  }

  public async getAllRequests(): Promise<{ [id: string]: IRequest }> {
    const resultMapping: { [id: string]: IRequest } = {}
    const consensus = await this.web3Service.getOrInitializeSCSC()
    const numRequests = await consensus.methods.numRequests().call()
    const start = numRequests > 0 ? numRequests - 1 : 0
    return this.getNextBatchRequests(resultMapping, start)
  }

  public async getLatestBlockHash(): Promise<number> {
    const consensus = await this.web3Service.getOrInitializeSCSC()
    const result = await consensus.methods.getLatestBlock().call()
    return result._latest
  }

  public onRequestAdded(cb: (id: BigNumber, request: IRequest) => void): unsubscribeFn {
    throw new Error("Method not implemented.")
  }

  public getNetworkActiveStake(): Promise<BigNumber> {
    throw new Error("Method not implemented.")
  }

  public getActiveStake(paymentId: BigNumber): Promise<BigNumber> {
    throw new Error("Method not implemented.")
  }

  public getStakerActiveStake(paymentId: BigNumber, stakerAddr: string): Promise<BigNumber> {
    throw new Error("Method not implemented.")
  }

  public getStakersForStakee(paymentId: BigNumber): Promise<string[]> {
    throw new Error("Method not implemented.")
  }

  public isBlockProducer(paymentId: BigNumber): Promise<boolean> {
    throw new Error("Method not implemented.")
  }

  public getRewardPercentages(): Promise<import("./@types").IRewardComponents> {
    throw new Error("Method not implemented.")
  }

  public getUnhandledRequests(limit: number, cursor?: BigNumber | undefined): Promise<IRequest[]> {
    throw new Error("Method not implemented.")
  }

  public getGasEstimateForRequest(requestId: BigNumber): Promise<BigNumber> {
    throw new Error("Method not implemented.")
  }

  public getExpectedGasRefund(requestIds: BigNumber[]): Promise<BigNumber> {
    throw new Error("Method not implemented.")
  }

  public getNumRequests(): Promise<number> {
    throw new Error("Method not implemented.")
  }

  public getNumBlocks(): Promise<number> {
    throw new Error("Method not implemented.")
  }

  public canSubmitBlock(address: string): Promise<boolean> {
    throw new Error("Method not implemented.")
  }

  public getMinimumXyoRequestBounty(): Promise<number> {
    throw new Error("Method not implemented.")
  }

  public submitBlock(
    blockProducer: string,
    previousBlock: BigNumber,
    requests: BigNumber[],
    supportingData: Buffer,
    responses: Buffer,
    signers: string[],
    sigR: Buffer[],
    sigS: Buffer[],
    sigV: Buffer[]
  ): Promise<BigNumber> {
    throw new Error("Method not implemented.")
  }

  public generateSignature(
    previousBlock: BigNumber,
    requests: BigNumber[],
    supportingData: Buffer,
    responses: Buffer
  ): Promise<ISignatureComponents> {
    throw new Error("Method not implemented.")
  }

  public createResponses(responses: IResponse[]): Promise<Buffer[]> {
    throw new Error("Method not implemented.")
  }

  public printSomething() {
    console.log('hello world')
  }

  private async getNextBatchRequests(
      unanswered: { [id: string]: IRequest }, start: number
    ): Promise<{ [id: string]: IRequest }> {
    const consensus = await this.web3Service.getOrInitializeSCSC()

    const batchRequests = 30 // num requests in search scope from end of request list
    const maxTransactions = 20 // max number of transactions to return in full batch

    const numUnAnswered = Object.keys(unanswered).length
    if (numUnAnswered >= maxTransactions || start === 0) {
      return unanswered
    }
    const promises = []

    for (let i = start; i >= 0 || promises.length >= batchRequests; i--) {
      promises.push(consensus.methods.requestChain(i).call())
    }

    const indexes = await Promise.all(promises)
    const idPromises = []
// tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < indexes.length; i++) {
      const request: Promise<IRequest | undefined> = this.getRequestById(indexes[i])
      if (request) {
        idPromises.push(request)
      }
    }
    const requests = await Promise.all(idPromises)

    requests.map((request, index) => {
      const req = request as IRequest
      if (!req.hasResponse && Object.keys(unanswered).length < maxTransactions) {
        unanswered[index] = req as IRequest
      }
    })
    return this.getNextBatchRequests(unanswered, start > batchRequests ? start - batchRequests : 0)
  }
}
