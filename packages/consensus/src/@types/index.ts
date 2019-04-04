import { BN } from '@xyo-network/utils'

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
  getNetworkActiveStake(blockHeight?: BN): Promise<BN>

  /**
   * Returns the active stake for a particular stakee
   *
   * @param {string} paymentId The paymentId (stakeeId)
   * @returns {Promise<string>}
   * @memberof IConsensusProvider
   */
  getActiveStake(paymentId: string, blockHeight?: BN): Promise<BN>

  /**
   * For a particular stakee and staker, returns the active stake
   *
   * @param {string} paymentId The stakee id
   * @param {string} stakerAddr The staker's address
   * @returns {Promise<BN>} The total active stake the staker has on the stakee
   * @memberof IConsensusProvider
   */
  getStakerActiveStake(paymentId: string, stakerAddr: string, blockHeight?: BN): Promise<BN>

  /**
   * Returns a list of stake objects a particular stakee
   *
   * @param {string} paymentId The stakeeId
   * @returns {Promise<string[]>} The list of stake datas
   * @memberof IConsensusProvider
   */
  getStakesForStakee(paymentId: string, blockHeight?: BN): Promise<IStake[]>

  /**
   * Given a stakeeId, will return true if the stakee is a block-producer, false otherwise
   *
   * @param {string} paymentId The stakeeId
   * @returns {Promise<boolean>} True if the the stakee is a block-producer, false otherwise
   * @memberof IConsensusProvider
   */
  isBlockProducer(paymentId: string, blockHeight?: BN): Promise<boolean>

  /**
   * The current reward coefficients for determining reward output
   *
   * @returns {Promise<IRewardComponents>}
   * @memberof IConsensusProvider
   */
  getRewardPercentages(blockHeight?: BN): Promise<IRewardComponents>

  /**
   * Returns the latest block hash. If no blocks yet exist, it
   * returns a 32-byte representation of 0
   *
   * @returns {Promise<string>}
   * @memberof IConsensusProvider
   */
  getLatestBlockHash(blockHeight?: BN): Promise<string>

  /**
   * Given a particular requestId, return the Request
   *
   * @param {string} id The request Id of interest ((which should be the hash of request itself))
   * @returns {(Promise<IRequest | undefined>)}
   * @memberof IConsensusProvider
   */
  getRequestById(id: string, blockHeight?: BN): Promise<IRequest | undefined>

  /**
   * Gets a page of recent requests in the system that do not have a response
   *
   * @returns {Promise<{[id: string]: IRequest}>} A dict where keys are the id of requests, and values are the request
   * @memberof IConsensusProvider
   */
  getNextUnhandledRequests(blockHeight?: BN): Promise<{[id: string]: IRequest}>

  /**
   * Given a particular requestId, returns the current gas estimate
   *
   * @param {string} requestId
   * @returns {Promise<BN>}
   * @memberof IConsensusProvider
   */
  getGasEstimateForRequest(requestId: string): Promise<BN>

  /**
   * Given a list of requestIds, returns the gas refund amount
   *
   * @param {string[]} requestIds A list of requestIds of interest
   * @returns {Promise<BN>}
   * @memberof IConsensusProvider
   */
  getExpectedGasRefund(requestIds: string[]): Promise<BN>

  /**
   * Returns the total number of requests without responses
   *
   * @returns {Promise<number>}
   * @memberof IConsensusProvider
   */
  getNumRequests(blockHeight?: BN): Promise<number>

  /**
   * Returns the total number of blocks in the block chain
   *
   * @returns {Promise<number>}
   * @memberof IConsensusProvider
   */
  getNumBlocks(blockHeight?: BN): Promise<number>

  /**
   * Returns true iff the `address` passed in can submit a block that
   * will be accepted given an unspecified algorithms way of determing
   * block-producer order
   *
   * @returns {Promise<boolean>}
   * @memberof IConsensusProvider
   */
  canSubmitBlock(address: string, blockHeight?: BN): Promise<boolean>

  /**
   * Returns the minimum XYO request bounty
   *
   * @returns {Promise<BN>}
   * @memberof IConsensusProvider
   */
  getMinimumXyoRequestBounty(blockHeight?: BN): Promise<BN>

  /**
   * Submits a block to the blockchain
   *
   * @param {string} previousBlock The previous blocks hash
   * @param {BN} agreedStakeBlockHeight The block height that the block witnesses agreed upon
   * @param {string[]} requests The list of requests inside the block
   * @param {string} supportingData The supporting data hash
   * @param {Buffer} responses A byte-array representation of the responses, positionally coupled with requests
   * @param {string[]} signers The list of signer addresses
   * @param {string[]} sigR The `R` part of the sig
   * @param {string[]} sigS The `S` part of the sig
   * @param {number[]} sigV The `V` part of the sig
   * @returns {Promise<BN>} Returns the hash the newly created block
   * @memberof IConsensusProvider
   */

  submitBlock(
    previousBlock: string,
    agreedStakeBlockHeight: BN,
    requests: string[],
    supportingData: string, // hash
    responses: Buffer,
    signers: string[],
    sigR: string[],
    sigS: string[],
    sigV: number[]
  ): Promise<string>

  /**
   * Given a previousBlockHash, a list of requests, a supportingDataHash, and responses,
   * generates an abi encoded hash
   *
   * ** NOTE consider adding `account` as parameter if needed
   *
   * @param {BN} previousBlock
   * @param {BN[]} requests
   * @param {Buffer} supportingData
   * @param {Buffer} responses
   * @returns {Promise<string>} The hash value of the ABI encoded block components
   * @memberof IConsensusProvider
   */
  encodeBlock(
    previousBlock: string,
    agreedStakeBlockHeight: BN,
    requests: string[],
    supportingData: string,
    responses: Buffer
  ): Promise<string>

  /**
   * Given a previousBlockHash, a list of requests, a supportingDataHash, and responses,
   * generates a signatures components.
   *
   * ** NOTE consider adding `account` as parameter if needed
   *
   * @param {string} block The hash value of the ABI encoded block components
   * @returns {Promise<ISignatureComponents>}
   * @memberof IConsensusProvider
   */
  signBlock(block: string): Promise<ISignatureComponents>

  /**
   * Given a list of responses, generates a response byte-array
   *
   * @param {IResponse[]} responses
   * @returns {Promise <Buffer[]>}
   * @memberof IConsensusProvider
   */
  createResponses(responses: IResponse[]): Buffer

  /**
   * Returns the percentage of the stake required to submit a new block
   *
   * Should return an integer value. Such that if the value is 66% this
   * should return `66`
   *
   * @returns {Promise<number>}
   * @memberof IConsensusProvider
   */
  getStakeQuorumPct(blockHeight?: BN): Promise<number>

  /**
   * Returns the current height of the ethereum chain
   *
   * @returns {Promise<BN>}
   * @memberof IConsensusProvider
   */
  getBlockHeight(): Promise<BN>

  /**
   * The minimum amount blocks built on top of a block to trust it
   *
   * @returns {Promise<number>}
   * @memberof IConsensusProvider
   */
  getBlockConfirmationTrustThreshold(): Promise<number>

  /**
   * Given a particular requestId, returns the block or undefined if none exists
   *
   * @param {string} requestId
   * @returns {Promise<IConsensusBlock | undefined>}
   * @memberof IConsensusProvider
   */
  getBlockForRequest(requestId: string): Promise<IConsensusBlock | undefined>

  /**
   * Given a particular requestId, returns the supporting data (IPFS hash string)
   *
   * @param {string} requestId
   * @returns {Promise<string | undefined>}
   * @memberof IConsensusProvider
   */
  getSupportingDataForRequest(requestId: string): Promise<string | undefined>

  /**
   * Sends a request to the smart contract
   *
   * @param {string} ipfsHash
   * @param {BN} bounty
   * @param {string} bountyFrom
   * @param {number} requestType
   * @returns {Promise<IRequest>}
   * @memberof IConsensusProvider
   */
  submitRequest(ipfsHash: string, bounty: BN, bountyFrom: string, requestType: number):
    Promise<IRequest | undefined>
}

/**
 * The stake data object
 *
 * @export
 * @interface IStake
 */
export interface IStake {
  amount: BN
  stakeBlock: BN
  unstakeBlock: BN
  stakee: string
  staker: string
  isActivated: boolean
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
  previousBlock: string
  createdAt: number // Block Height in ethereum blocks
  supportingData: string
  stakingBlock: number
  creator: string
}

/**
 * A representation of the request in the blockchain
 *
 * @export
 * @interface IRequest
 */
export interface IRequest {
  request?: string
  xyoBounty: BN
  weiMining: BN
  createdAt: BN // Block Height in ethereum blocks
  responseBlockNumber: BN
  requestSender: string
  requestType: IRequestType // 1-byte number
}

/**
 * A representation of a Response in the blockchain
 *
 * @export
 * @interface IResponse
 */
export interface IResponse {
  boolResponse: boolean
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
  DEFAULT = 0,
  BOOL_COMPLETION = 1,
  UINT_COMPLETION = 2,
  WITHDRAW = 3,
  BOOL = 4,
  UINT = 5
}

/**
 * The signatures components of ECDSA signatures
 *
 * @export
 * @interface ISignatureComponents
 */
export interface ISignatureComponents {
  publicKey: string
  sigR: string,
  sigS: string,
  sigV: number
  signature?: string
}
