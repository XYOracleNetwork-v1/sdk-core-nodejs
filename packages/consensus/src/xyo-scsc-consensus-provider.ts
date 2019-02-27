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

import { IConsensusProvider, IRequest, ISignatureComponents, IResponse, IRewardComponents } from './@types'
import { BigNumber } from 'bignumber.js'
import { XyoBase } from '@xyo-network/base'
import { XyoWeb3Service } from '@xyo-network/web3-service'

export class XyoScscConsensusProvider extends XyoBase implements IConsensusProvider {

  private web3Service: XyoWeb3Service

  constructor(private readonly web3: XyoWeb3Service) {
    super()
    this.web3Service = web3
  }

  public async getRequestById(id: BigNumber): Promise<IRequest | undefined> {
    const consensus = await this.web3Service.getOrInitializeSCSC()
    const req = consensus.methods.requestsById(id).call()
    if (req.createdAt && req.createdAt.toNumber() === 0) {
      return undefined
    }
    return req
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

  public async getNetworkActiveStake(): Promise<BigNumber> {
    const consensus = await this.web3Service.getOrInitializeSCSC()
    return consensus.methods.totalActiveStake().call()
  }

  public async getActiveStake(paymentId: BigNumber): Promise<BigNumber> {
    const consensus = await this.web3Service.getOrInitializeSCSC()
    const stakeeStake = await consensus.methods.stakeeStake(paymentId).call()
    return stakeeStake.activeStake
  }

  public async getStakerActiveStake(paymentId: BigNumber, stakerAddr: string): Promise<BigNumber> {
    const consensus = await this.web3Service.getOrInitializeSCSC()
    const numStakerStakes = await consensus.methods.numStakerStakes(stakerAddr)
    const numStakeeStakes = await consensus.methods.numStakeeStakes(paymentId)

    const stakeIdPromises = []
    if (numStakerStakes < numStakeeStakes) {
      for (let i = 0; i < numStakerStakes; i++) {
        stakeIdPromises.push(consensus.methods.stakerToStakingIds(stakerAddr, i).call())
      }
    } else {
      for (let i = 0; i < numStakeeStakes; i++) {
        stakeIdPromises.push(consensus.methods.stakeeToStakingIds(paymentId, i).call())
      }
    }
    const stakeIds = await Promise.all(stakeIdPromises)

    if (stakeIds.length === 0) {
      return new BigNumber(0)
    }
    const stakeFeches = stakeIds.map(async (id: any) => consensus.methods.stakeData(id))
    const stakeDatas = await Promise.all(stakeFeches)
    const activeStake = new BigNumber(0)
    stakeDatas.forEach((stakeData: any) => {
      console.log("LOOKING AT STAKE DATA", stakeData)
      if (stakeData.staker === stakerAddr && stakeData.stakee === paymentId) {
        activeStake.plus(stakeData.amount)
      }
    })
    return activeStake
  }

  public getStakersForStakee(paymentId: BigNumber): Promise<string[]> {
    throw new Error("Method not implemented.")
  }

  public async getPaymentIdFromAddress(publicKey: string): Promise<BigNumber> {
    throw new Error("Method not implemented.")
  }

  public async isBlockProducer(paymentId: BigNumber): Promise<boolean> {
    const stakable = await this.web3Service.getOrInitializeStakableTokenContract()
    return stakable.methods.isBlockProducer(paymentId).call()
  }

  public async getRewardPercentages(): Promise<IRewardComponents> {
    const consensus = await this.web3Service.getOrInitializeSCSC()
    // TODO load the Paramaterizer contract instead
    const bpReward = await consensus.methods.params.get('xyBlockProducerRewardPct').call()
    const rewardComponents: IRewardComponents = {
      blockProducers: bpReward,
      supporters: 100 - bpReward
    }
    return rewardComponents
  }

  public async getNumRequests(): Promise<number> {
    const consensus = await this.web3Service.getOrInitializeSCSC()
    return consensus.methods.numRequests().call()
  }

  public async getNumBlocks(): Promise<number> {
    const consensus = await this.web3Service.getOrInitializeSCSC()
    return consensus.methods.numBlocks().call()
  }

  public getGasEstimateForRequest(requestId: BigNumber): Promise<BigNumber> {
    throw new Error("Method not implemented.")
  }

  public async getExpectedGasRefund(requestIds: BigNumber[]): Promise<BigNumber> {
    const requests = await this.getRequests(requestIds)
    const total = new BigNumber(0)
    requests.forEach((req) => {
      total.plus(req.weiMining)
    })
    return total
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

  private async getRequests(indexes: BigNumber[]): Promise<IRequest[]> {
    const idPromises = []
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < indexes.length; i++) {
      const req: Promise<IRequest | undefined> = this.getRequestById(indexes[i])
      if (req) {
        idPromises.push(req)
      }
    }
    return Promise.all(idPromises) as Promise<IRequest[]>
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
    const requests = await this.getRequests(indexes)

    requests.map((req1, index) => {
      const req = req1 as IRequest
      if (!req.hasResponse && Object.keys(unanswered).length < maxTransactions) {
        unanswered[index] = req as IRequest
      }
    })
    return this.getNextBatchRequests(unanswered, start > batchRequests ? start - batchRequests : 0)
  }
}
