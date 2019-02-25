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

  constructor(private readonly web3Service: XyoWeb3Service) {
    super()
  }

  public getAllRequests(): Promise<{ [id: string]: IRequest; }> {
    throw new Error("Method not implemented.")
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

  public getLatestBlock(): Promise<import("./@types").IConsensusBlock | undefined> {
    throw new Error("Method not implemented.")
  }

  public getRequestById(id: BigNumber): Promise<import("./@types").IRequest | undefined> {
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
}
