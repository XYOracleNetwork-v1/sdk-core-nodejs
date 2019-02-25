import { BigNumber } from 'bignumber.js'
import { unsubscribeFn } from "@xyo-network/utils"

/**
 * Serves as the layer between the application and a blockchain
 *
 * @export
 * @interface IConsensusProvider
 */
export interface IConsensusProvider {

  /**
   * Returns the total active state of the network
   *
   * @returns {Promise<number>}
   * @memberof IConsensusProvider
   */
  getNetworkActiveStake(): Promise<BigNumber>

  /**
   * Returns the active stake for a particular stakee
   *
   * @param {BigNumber} paymentId The paymentId (stakeeId)
   * @returns {Promise<BigNumber>}
   * @memberof IConsensusProvider
   */
  getActiveStake(paymentId: BigNumber): Promise<BigNumber>

  /**
   * For a particular stakee and staker, returns the active stake
   *
   * @param {BigNumber} paymentId The stakee id
   * @param {string} stakerAddr The staker's address
   * @returns {Promise<BigNumber>} The total active stake the staker has on the stakee
   * @memberof IConsensusProvider
   */
  getStakerActiveStake(paymentId: BigNumber, stakerAddr: string): Promise<BigNumber>

  /**
   * Returns a list of staker address for a particular stakee
   *
   * @param {BigNumber} paymentId The stakeeId
   * @returns {Promise<string[]>} The list of addresses that are staking the stakee
   * @memberof IConsensusProvider
   */
  getStakersForStakee(paymentId: BigNumber): Promise<string[]>

  /**
   * Given a stakeeId, will return true if the stakee is a block-producer, false otherwise
   *
   * @param {BigNumber} paymentId The stakeeId
   * @returns {Promise<boolean>} True if the the stakee is a block-producer, false otherwise
   * @memberof IConsensusProvider
   */
  isBlockProducer(paymentId: BigNumber): Promise<boolean>

  /**
   * The current reward coefficients for determining reward output
   *
   * @returns {Promise<IRewardComponents>}
   * @memberof IConsensusProvider
   */
  getRewardPercentages(): Promise<IRewardComponents>

  /**
   * Returns the most recent block in the blockchain, undefined it there is not yet a block
   *
   * @returns {(Promise<IConsensusBlock | undefined>)}
   * @memberof IConsensusProvider
   */
  getLatestBlock(): Promise<IConsensusBlock | undefined>

  /**
   * Given a particular requestId, return the Request
   *
   * @param {BigNumber} id The request Id of interest ((which should be the hash of request itself))
   * @returns {(Promise<IRequest | undefined>)}
   * @memberof IConsensusProvider
   */
  getRequestById(id: BigNumber): Promise<IRequest | undefined>

  /**
   * Gets all the requests in the system that do not have a response
   *
   * @returns {Promise<{[id: string]: IRequest}>} A dict where keys are the id of requests, and values are the request
   * @memberof IConsensusProvider
   */
  getAllRequests(): Promise<{[id: string]: IRequest}>

  /**
   * Register a callback for when a new request is added.
   * Returns an `unsubscribeFn` that can be called to stop listening
   *
   * @param {(id: BigNumber, request: IRequest) => void} cb
   * @returns {unsubscribeFn}
   * @memberof IConsensusProvider
   */
  onRequestAdded(cb: (id: BigNumber, request: IRequest) => void): unsubscribeFn

  /**
   * Returns a paginated list of unhandled requests, given a limit and
   * an optional cursor
   *
   * @param {number} limit The max the number of results to return
   * @param {BigNumber} cursor An optional cursor value to offset the pagination
   * @returns {Promise<IRequest[]>}
   * @memberof IConsensusProvider
   */
  getUnhandledRequests(limit: number, cursor?: BigNumber): Promise<IRequest[]>

  /**
   * Given a particular requestId, returns the current gas estimate
   *
   * @param {BigNumber} requestId
   * @returns {Promise<BigNumber>}
   * @memberof IConsensusProvider
   */
  getGasEstimateForRequest(requestId: BigNumber): Promise<BigNumber>

  /**
   * Given a list of requestIds, returns the gas refund amount
   *
   * @param {BigNumber[]} requestIds A list of requestIds of interest
   * @returns {Promise<BigNumber>}
   * @memberof IConsensusProvider
   */
  getExpectedGasRefund(requestIds: BigNumber[]): Promise<BigNumber>

  /**
   * Returns the total number of requests without responses
   *
   * @returns {Promise<number>}
   * @memberof IConsensusProvider
   */
  getNumRequests(): Promise<number>

  /**
   * Returns the total number of blocks in the block chain
   *
   * @returns {Promise<number>}
   * @memberof IConsensusProvider
   */
  getNumBlocks(): Promise<number>

  /**
   * Returns true iff the `address` passed in can submit a block that
   * will be accepted given an unspecified algorithms way of determing
   * block-producer order
   *
   * @returns {Promise<boolean>}
   * @memberof IConsensusProvider
   */
  canSubmitBlock(address: string): Promise<boolean>

  /**
   * Returns the minimum XYO request bounty
   *
   * @returns {Promise<number>}
   * @memberof IConsensusProvider
   */
  getMinimumXyoRequestBounty(): Promise<number>

  /**
   * Submits a block to the blockchain
   *
   * @param {string} blockProducer The address of the block producer
   * @param {BigNumber} previousBlock The previous blocks hash
   * @param {BigNumber[]} requests The list of requests inside the block
   * @param {Buffer} supportingData The supporting data hash
   * @param {Buffer} responses A byte-array representation of the responses, positionally coupled with requests
   * @param {string[]} signers The list of signer addresses
   * @param {Buffer[]} sigR The `R` part of the sig
   * @param {Buffer[]} sigS The `S` part of the sig
   * @param {Buffer[]} sigV The `V` part of the sig
   * @returns {Promise<BigNumber>} Returns the hash the newly created block
   * @memberof IConsensusProvider
   */

  submitBlock(
    blockProducer: string,
    previousBlock: BigNumber,
    requests: BigNumber[],
    supportingData: Buffer, // hash
    responses: Buffer,
    signers: string[],
    sigR: Buffer[],
    sigS: Buffer[],
    sigV: Buffer[]
  ): Promise<BigNumber>

  /**
   * Given a previousBlockHash, a list of requests, a supportingDataHash, and responses,
   * generates a signatures components.
   *
   * ** NOTE consider adding `account` as parameter if needed
   *
   * @param {BigNumber} previousBlock
   * @param {BigNumber[]} requests
   * @param {Buffer} supportingData
   * @param {Buffer} responses
   * @returns {Promise<ISignatureComponents>}
   * @memberof IConsensusProvider
   */
  generateSignature(
    previousBlock: BigNumber,
    requests: BigNumber[],
    supportingData: Buffer,
    responses: Buffer
  ): Promise<ISignatureComponents>

  /**
   * Given a list of responses, generates a response byte-array
   *
   * @param {IResponse[]} responses
   * @returns {Promise <Buffer[]>}
   * @memberof IConsensusProvider
   */
  createResponses(responses: IResponse[]): Promise <Buffer[]>
}

/**
 * The inputs that effect the rewards distribution
 *
 * @export
 * @interface IRewardComponents
 */
export interface IRewardComponents {
  blockProducers: number
  supporters: number
}

/**
 * A representation of the block in the block chain
 *
 * @export
 * @interface IConsensusBlock
 */
export interface IConsensusBlock {
  previousBlock: BigNumber,
  createdAt: number // Block Height in ethereum blocks
  supportingData: Buffer
  creator: string
}

/**
 * A representation of the request in the blockchain
 *
 * @export
 * @interface IRequest
 */
export interface IRequest {
  xyoBounty: number
  weiMining: number
  miningProvider: number
  createdAt: number // Block Height in ethereum blocks
  requestSender: string
  requestType: IRequestType // 1-byte number
  hasResponse: boolean
}

/**
 * A representation of a Response in the blockchain
 *
 * @export
 * @interface IResponse
 */
export interface IResponse {
  boolResponse: number
  numResponse: number
  withdrawResponse: number // Block Height in ethereum blocks
}

/**
 * The supporting requests type's. Consider extending if necessary
 *
 * @export
 * @enum {number}
 */
export enum IRequestType { // something like this maybe, maybe-not
  Bool = 1,
  UINT = 2,
  WITHDRAW = 3
}

/**
 * The signatures components of ECDSA signatures
 *
 * @export
 * @interface ISignatureComponents
 */
export interface ISignatureComponents {
  sigR: Buffer,
  sigS: Buffer,
  sigV: Buffer
}
