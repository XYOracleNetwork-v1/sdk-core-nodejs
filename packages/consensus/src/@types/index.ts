import { BigNumber } from 'bignumber.js'

export interface IConsensusProvider {

  /**
   * Returns the total active state of the network
   *
   * @returns {Promise<number>}
   * @memberof IConsensusProvider
   */
  getNetworkActiveState(): Promise<number>

  /**
   * Returns the active stake for a particular stakee
   *
   * @returns {Promise<number>}
   * @memberof IConsensusProvider
   */
  getActiveStakeeStake(paymentId: BigNumber): Promise<number>

  getLatestBlock(): Promise<IEthBlock | undefined>

  getRequestById(id: BigNumber): Promise<IRequest | undefined>

  getUnhandledRequests(): Promise<IRequest[]> // returns an empty list if none are present

  getGasEstimateForRequest(requestId: BigNumber): Promise<number>

  getExpectedGasRefund(requestIds: BigNumber[]): Promise<number>

  getNumRequests(): Promise<number>

  getNumBlocks(): Promise<number>

  canSubmitBlock(): Promise<boolean>

  submitBlock(
    blockProducer: string,
    previousBlock: BigNumber,
    requests: BigNumber[],
    payloadData: Buffer, // hash
    responses: Buffer,
    signers: string[],
    sigR: Buffer[],
    sigS: Buffer[],
    sigV: Buffer[]
  ): Promise<BigNumber>

  generateSignature(
    previousBlock: BigNumber,
    requests: BigNumber[],
    payloadData: Buffer,
    responses: Buffer
  ): Promise<ISignatureComponents>

  createResponses(responses: IResponse[]): Promise <Buffer[]>
}

export interface IEthBlock {
  previousBlock: BigNumber,
  createdAt: number // Block Height in ethereum blocks
  supportingData: Buffer
  creator: string
}

export interface IRequest {
  xyoBounty: number
  weiMining: number
  createdAt: number // Block Height in ethereum blocks
  requestSender: string
  requestType: IRequestType // 1-byte number
  hasResponse: boolean
}

export interface IResponse {
  boolResponse: number
  numResponse: number
  withdrawResponse: number // Block Height in ethereum blocks
}
export enum IRequestType { // something like this maybe, maybe-not
  Bool = 1,
  UINT = 2,
  WITHDRAW = 3
}

export interface ISignatureComponents {
  sigR: Buffer,
  sigS: Buffer,
  sigV: Buffer
}
