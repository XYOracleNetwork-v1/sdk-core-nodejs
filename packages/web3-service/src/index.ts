/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st December 2018 12:55:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 25th January 2019 2:00:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export {
  IConsensusContract
} from './@types'

import Web3 from 'web3'
import { IConsensusContract, IContractData } from './@types'

import { XyoBase } from '@xyo-network/base'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { HttpProvider } from 'web3-providers'

export class XyoWeb3Service extends XyoBase {
  private scscContract: IConsensusContract | undefined
  private web3: Web3 | undefined

  constructor (
    private readonly web3ProviderArgs: any,
    public readonly currentUser: string,
    private readonly existingContracts: {[contractName: string]: IContractData}
  ) {
    super()
  }

  public async getContractByName(name: string) {
    const web3 = await this.getOrInitializeWeb3()
    const abi = await this.getABIOfContract(name)
    const address = await this.getAddressOfContract(name)

    try {
      const contract = new web3.eth.Contract(abi, address)
      return contract
    } catch (err) {
      this.logError(`There was an error retrieving contract with name ${name}`, err)
      throw err
    }
  }

  public getABIOfContract(name: string): any {
    return stubABI
    // TODO get from IPFS hash in config
  }

  public async getAddressOfContract(name: string): Promise<string> {
    const contract = this.existingContracts[name]
    if (!contract) {
      throw new XyoError(`Could not find contract with name ${name}`, XyoErrors.CRITICAL)
    }

    return contract.address
  }

  public async getOrInitializeSCSC(): Promise<any> {
    if (this.scscContract) {
      return this.scscContract
    }
    this.scscContract = await this.getContractByName("XyStakingConsensus") as IConsensusContract
    return this.scscContract
  }

  private async getOrInitializeWeb3(): Promise<Web3> {
    if (this.web3) {
      return this.web3
    }

    if (!this.web3ProviderArgs) {
      throw new XyoError('No web3 provider args provided', XyoErrors.CRITICAL)
    }

    if (typeof this.web3ProviderArgs !== 'string') { // Consider extending this
      throw new XyoError('Web3 initialization parameters need to be a string', XyoErrors.CRITICAL)
    }

    const httpProvider = new HttpProvider(this.web3ProviderArgs)
    this.web3 = new Web3(httpProvider)
    return this.web3
  }
}

const stubABI = [
  {
    constant: true,
    inputs: [
      {
        name: "stakee",
        type: "uint256"
      }
    ],
    name: "numStakeeStakes",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x00f0b09c"
  },
  {
    constant: true,
    inputs: [],
    name: "stakeCooldown",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x038011ae"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "stakeeStake",
    outputs: [
      {
        name: "totalStake",
        type: "uint256"
      },
      {
        name: "activeStake",
        type: "uint256"
      },
      {
        name: "totalUnstake",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x0d4a7624"
  },
  {
    constant: true,
    inputs: [],
    name: "xyoToken",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x14fa8a25"
  },
  {
    constant: false,
    inputs: [
      {
        name: "stakingId",
        type: "uint256"
      }
    ],
    name: "withdrawStake",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x25d5971f"
  },
  {
    constant: true,
    inputs: [],
    name: "totalActiveStake",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x28f73148"
  },
  {
    constant: false,
    inputs: [
      {
        name: "stakingId",
        type: "uint256"
      }
    ],
    name: "unstake",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x2e17de78"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "stakerStake",
    outputs: [
      {
        name: "totalStake",
        type: "uint256"
      },
      {
        name: "activeStake",
        type: "uint256"
      },
      {
        name: "totalUnstake",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x36032486"
  },
  {
    constant: true,
    inputs: [
      {
        name: "actionType",
        type: "uint8"
      }
    ],
    name: "isUnstakeAction",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "pure",
    type: "function",
    signature: "0x38c226ac"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "stakeData",
    outputs: [
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "stakeBlock",
        type: "uint256"
      },
      {
        name: "unstakeBlock",
        type: "uint256"
      },
      {
        name: "stakee",
        type: "uint256"
      },
      {
        name: "staker",
        type: "address"
      },
      {
        name: "isActivated",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x4a90bc3f"
  },
  {
    constant: true,
    inputs: [
      {
        name: "staker",
        type: "address"
      }
    ],
    name: "getAvailableStakerUnstake",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x6762b2f1"
  },
  {
    constant: false,
    inputs: [
      {
        name: "stakingId",
        type: "uint256"
      }
    ],
    name: "activateStake",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x69d3c464"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "stakingStakeeIndex",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x7a08e22b"
  },
  {
    constant: false,
    inputs: [
      {
        name: "stakee",
        type: "uint256"
      },
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "stake",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x7b0472f0"
  },
  {
    constant: true,
    inputs: [
      {
        name: "staker",
        type: "address"
      }
    ],
    name: "totalStakeAndUnstake",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x7cd44a8a"
  },
  {
    constant: true,
    inputs: [],
    name: "unstakeCooldown",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x7eefd5ae"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      },
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "stakerToStakingIds",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x8ccc3544"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "stakingStakerIndex",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x9daf20b1"
  },
  {
    constant: false,
    inputs: [
      {
        name: "batchLimit",
        type: "uint256"
      }
    ],
    name: "withdrawManyStake",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0xb0c25dfc"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "requestChain",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xb1ff4715"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "blockChain",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xb35af56f"
  },
  {
    constant: true,
    inputs: [],
    name: "penaltyStake",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xc1ae3cd2"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "stakeeToStakingIds",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xc1bb2488"
  },
  {
    constant: true,
    inputs: [],
    name: "params",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xcff0ab96"
  },
  {
    constant: false,
    inputs: [
      {
        name: "stakee",
        type: "uint256"
      },
      {
        name: "startIndex",
        type: "uint256"
      },
      {
        name: "batchSize",
        type: "uint256"
      }
    ],
    name: "resolveGovernanceAction",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0xd763b662"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "requestsById",
    outputs: [
      {
        name: "xyoBounty",
        type: "uint256"
      },
      {
        name: "weiMining",
        type: "uint256"
      },
      {
        name: "createdAt",
        type: "uint256"
      },
      {
        name: "requestSender",
        type: "address"
      },
      {
        name: "requestType",
        type: "uint8"
      },
      {
        name: "hasResponse",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xd8e1feed"
  },
  {
    constant: true,
    inputs: [
      {
        name: "staker",
        type: "address"
      }
    ],
    name: "numStakerStakes",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xe4f5425d"
  },
  {
    constant: true,
    inputs: [
      {
        name: "stakee",
        type: "uint256"
      }
    ],
    name: "getAvailableStakeeUnstake",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xee7263e2"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "blocks",
    outputs: [
      {
        name: "previousBlock",
        type: "uint256"
      },
      {
        name: "createdAt",
        type: "uint256"
      },
      {
        name: "supportingData",
        type: "bytes32"
      },
      {
        name: "creator",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xf25b3f99"
  },
  {
    inputs: [
      {
        name: "_token",
        type: "address"
      },
      {
        name: "_stakableToken",
        type: "address"
      },
      {
        name: "_governanceContract",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
    signature: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "request",
        type: "uint256"
      },
      {
        indexed: false,
        name: "xyoBounty",
        type: "uint256"
      },
      {
        indexed: false,
        name: "weiMining",
        type: "uint256"
      },
      {
        indexed: false,
        name: "requestSender",
        type: "address"
      },
      {
        indexed: false,
        name: "requestType",
        type: "uint8"
      }
    ],
    name: "RequestSubmitted",
    type: "event",
    signature: "0x8334223cc61968d8de1aecbdeb85f3ea7b8253a4e780cc28511e2a5e5a4a5a1a"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "blockHash",
        type: "uint256"
      },
      {
        indexed: false,
        name: "previousBlock",
        type: "uint256"
      },
      {
        indexed: false,
        name: "createdAtBlock",
        type: "uint256"
      },
      {
        indexed: false,
        name: "payloadHash",
        type: "bytes32"
      },
      {
        indexed: false,
        name: "blockProducer",
        type: "address"
      }
    ],
    name: "BlockCreated",
    type: "event",
    signature: "0xad72afefb6af06a14501f6bf2db4c0284f6dd67c64be6177c6736d8086eede54"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "beneficiary",
        type: "address"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "stakerStake",
        type: "uint256"
      }
    ],
    name: "RewardClaimed",
    type: "event",
    signature: "0xf01da32686223933d8a18a391060918c7f11a3648639edd87ae013e2e2731743"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "staker",
        type: "address"
      },
      {
        indexed: false,
        name: "stakingId",
        type: "uint256"
      },
      {
        indexed: false,
        name: "stakee",
        type: "uint256"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      }
    ],
    name: "Staked",
    type: "event",
    signature: "0xb4caaf29adda3eefee3ad552a8e85058589bf834c7466cae4ee58787f70589ed"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "staker",
        type: "address"
      },
      {
        indexed: false,
        name: "stakingId",
        type: "uint256"
      },
      {
        indexed: false,
        name: "stakee",
        type: "uint256"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      }
    ],
    name: "ActivatedStake",
    type: "event",
    signature: "0x59150db791cd1ccaa5f5f1b1a6f777895e2494ee35275c946f3e3386b3adc206"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "staker",
        type: "address"
      },
      {
        indexed: false,
        name: "stakingId",
        type: "uint256"
      },
      {
        indexed: false,
        name: "stakee",
        type: "uint256"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      }
    ],
    name: "Unstaked",
    type: "event",
    signature: "0x204fccf0d92ed8d48f204adb39b2e81e92bad0dedb93f5716ca9478cfb57de00"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "staker",
        type: "address"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      }
    ],
    name: "Withdrawl",
    type: "event",
    signature: "0x65ac0d8bb8cbc0e989ebd02ddc5161d7c499f7c21792e43fcf170314fe6bcc3f"
  },
  {
    constant: true,
    inputs: [],
    name: "getLatestBlock",
    outputs: [
      {
        name: "_latest",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x61d6f78a"
  },
  {
    constant: false,
    inputs: [
      {
        name: "xyoBounty",
        type: "uint256"
      }
    ],
    name: "withdrawRewardsRequest",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: true,
    stateMutability: "payable",
    type: "function",
    signature: "0xa17a43bf"
  },
  {
    constant: false,
    inputs: [
      {
        name: "request",
        type: "uint256"
      },
      {
        name: "xyoBounty",
        type: "uint256"
      },
      {
        name: "xyoSender",
        type: "address"
      },
      {
        name: "requestType",
        type: "uint8"
      }
    ],
    name: "submitRequest",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
    signature: "0x5cf7d040"
  },
  {
    constant: false,
    inputs: [
      {
        name: "blockProducer",
        type: "uint256"
      },
      {
        name: "previousBlock",
        type: "uint256"
      },
      {
        name: "_requests",
        type: "uint256[]"
      },
      {
        name: "payloadData",
        type: "bytes32"
      },
      {
        name: "responses",
        type: "bytes"
      },
      {
        name: "signers",
        type: "address[]"
      },
      {
        name: "sigR",
        type: "bytes32[]"
      },
      {
        name: "sigS",
        type: "bytes32[]"
      },
      {
        name: "sigV",
        type: "uint8[]"
      }
    ],
    name: "submitBlock",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0xef9b9b38"
  },
  {
    constant: true,
    inputs: [],
    name: "numRequests",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x9fb42b1f"
  },
  {
    constant: true,
    inputs: [],
    name: "numBlocks",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x930fc216"
  }
]
