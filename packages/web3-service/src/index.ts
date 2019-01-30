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

import Web3 from 'web3'

import { XyoBase } from '@xyo-network/base'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { HttpProvider } from 'web3-providers'

export class XyoWeb3Service extends XyoBase {

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

  public async getABIOfContract(name: string): Promise<any[]> {
    if (name === 'PayOnDelivery') {
      return payForDeliveryABI
    }

    throw new Error('Not yet implemented')
  }

  public async getAddressOfContract(name: string): Promise<string> {
    const contract = this.existingContracts[name]
    if (!contract) {
      throw new XyoError(`Could not find contract with name ${name}`, XyoErrors.CRITICAL)
    }

    return contract.address
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

const payForDeliveryABI = [
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    name: 'questions',
    outputs: [
      {
        name: 'itemA',
        type: 'string'
      },
      {
        name: 'itemB',
        type: 'string'
      },
      {
        name: 'marker',
        type: 'string'
      },
      {
        name: 'questionId',
        type: 'uint256'
      },
      {
        name: 'beneficiary',
        type: 'address'
      },
      {
        name: 'buyer',
        type: 'address'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: 'account',
        type: 'address'
      }
    ],
    name: 'isSigner',
    outputs: [
      {
        name: '',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [
      {
        name: '',
        type: 'address'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'isOwner',
    outputs: [
      {
        name: '',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'uint256'
      },
      {
        name: '',
        type: 'address'
      }
    ],
    name: '_deposits',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'renounceSigner',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'account',
        type: 'address'
      }
    ],
    name: 'addSigner',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'transferOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'itemA',
        type: 'string'
      },
      {
        indexed: false,
        name: 'itemB',
        type: 'string'
      },
      {
        indexed: false,
        name: 'marker',
        type: 'string'
      },
      {
        indexed: false,
        name: 'weiAmount',
        type: 'uint256'
      },
      {
        indexed: false,
        name: 'beneficiary',
        type: 'address'
      }
    ],
    name: 'DeliveryQuestion',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'itemA',
        type: 'string'
      },
      {
        indexed: false,
        name: 'itemB',
        type: 'string'
      },
      {
        indexed: false,
        name: 'weiAmount',
        type: 'uint256'
      },
      {
        indexed: false,
        name: 'beneficiary',
        type: 'address'
      }
    ],
    name: 'PayedForDelivery',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'account',
        type: 'address'
      }
    ],
    name: 'SignerAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'account',
        type: 'address'
      }
    ],
    name: 'SignerRemoved',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: true,
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    constant: true,
    inputs: [
      {
        name: 'itemA',
        type: 'string'
      },
      {
        name: 'itemB',
        type: 'string'
      }
    ],
    name: 'itemHash',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'pure',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: 'itemA',
        type: 'string'
      },
      {
        name: 'itemB',
        type: 'string'
      },
      {
        name: 'beneficiary',
        type: 'address'
      }
    ],
    name: 'depositsFor',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'itemA',
        type: 'string'
      },
      {
        name: 'itemB',
        type: 'string'
      },
      {
        name: 'beneficiary',
        type: 'address'
      },
      {
        name: 'marker',
        type: 'string'
      }
    ],
    name: 'escrowPayment',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'itemA',
        type: 'string'
      },
      {
        name: 'itemB',
        type: 'string'
      },
      {
        name: 'beneficiary',
        type: 'address'
      }
    ],
    name: 'payForDelivery',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'itemA',
        type: 'string'
      },
      {
        name: 'itemB',
        type: 'string'
      },
      {
        name: 'beneficiary',
        type: 'address'
      }
    ],
    name: 'refundPayment',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

export interface IContractData {
  address: string
}
