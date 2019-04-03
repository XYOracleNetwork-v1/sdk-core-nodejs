/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 27th February 2019 2:12:26 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-producer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 11th March 2019 5:01:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBlockProducer } from "../xyo-block-producer"
import { IConsensusProvider, ISignatureComponents } from "@xyo-network/consensus"
import { BN } from "@xyo-network/utils"
import { getHashingProvider } from "@xyo-network/hashing"
import { IXyoTransaction, IXyoTransactionRepository } from "@xyo-network/transaction-pool"
import { IXyoNodeNetwork } from "@xyo-network/node-network"
import { IXyoMetaList } from "@xyo-network/meta-list"
import { XyoIpfsClient } from '@xyo-network/ipfs-client'
import { XyoBlockWitnessValidator } from "@xyo-network/block-witness"

jest.setTimeout(1000000)

describe('BlockProducer', () => {

  it('Block Producer should submit block because it has enough stake themselves', async () => {
    const accountAddr = '0xffff' // account address
    let submitBlockGotCalled = false
    const consensusProvider = await getConsensusProvider({
      nextUnhandledRequests: () => {
        return {
          DEF: {}
        }
      },
      canSubmitBlock: () => true,
      latestBlockHash: () => "0x100",
      encodeBlock: () => "0x200",
      networkActiveStake: () => new BN(10000),
      activeStakeByPaymentId: {
        [accountAddr]: new BN("6000")
      },
      onSubmitBlock: (
        agreedStakeBlockHeight: BN,
        previousBlock: string,
        requests: string[],
        supportingData: string, // hash
        responses: Buffer,
        signers: string[],
        sigR: string[],
        sigS: string[],
        sigV: number[]
      ) => {
        submitBlockGotCalled = true
        return undefined
      }
    })

    const availableValidatedTransactions = await getAvailableValidatedTransactions([{
      transactionType: 'request-response',
      data: {
        request: {
          request: {
            data: {
              partyOne: ['456'],
              partyTwo: ['789'],
              markers: [],
              direction: 'FORWARD'
            },
            getId: () => 'DEF',
          },
          id: 'DEF'
        },
        response: {}
      }
    }])

    const hashProvider = await getHashingProvider('sha3')
    const nodeNetwork = await getNodeNetwork()
    const ipfs = await getContentService()
    const validator = await getBlockWitnessValidator()

    const producer = new XyoBlockProducer(
      consensusProvider,
      accountAddr,
      availableValidatedTransactions,
      hashProvider,
      nodeNetwork,
      ipfs,
      validator
    )

    producer.start()
    await new Promise((resolve, reject) => {
      setTimeout(async () => {
        await producer.stop()
        try {
          expect(submitBlockGotCalled).toBe(true)
          resolve()
        } catch (e) {
          reject(e)
        }
      }, 1500)
    })
  })

  it('Block Producer should not submit block it does not have enough stake', async () => {
    const accountAddr = '0xffff'
    let submitBlockGotCalled = false
    const consensusProvider = await getConsensusProvider({
      canSubmitBlock: () => true,
      latestBlockHash: () => "100",
      nextUnhandledRequests: () => {
        return { DEF: true }
      },
      encodeBlock: () => "0x200",
      networkActiveStake: () => new BN(100000), // <----- Increase active stake
      activeStakeByPaymentId: {
        [accountAddr]: new BN("6000")
      },
      onSubmitBlock: (
        agreedStakeBlockHeight: BN,
        previousBlock: string,
        requests: string[],
        supportingData: string, // hash
        responses: Buffer,
        signers: string[],
        sigR: string[],
        sigS: string[],
        sigV: number[]
      ) => {
        submitBlockGotCalled = true
        return undefined
      }
    })

    const availableValidatedTransactions = await getAvailableValidatedTransactions([{
      transactionType: 'request-response',
      data: {
        request: {
          request: {
            data: {
              partyOne: ['456'],
              partyTwo: ['789'],
              markers: [],
              direction: 'FORWARD'
            },
            getId: () => 'DEF',
          },
          id: 'DEF'
        },
        response: {}
      }
    }])

    let unsubscribeCalled = false
    const hashProvider = await getHashingProvider('sha3')
    const nodeNetwork = await getNodeNetwork({
      unsubscribe: () => unsubscribeCalled = true
    })

    const validator = await getBlockWitnessValidator()
    const ipfs = await getContentService()
    const producer = new XyoBlockProducer(
      consensusProvider,
      accountAddr,
      availableValidatedTransactions,
      hashProvider,
      nodeNetwork,
      ipfs,
      validator
    )

    producer.start()
    await new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          await producer.stop()
          expect(submitBlockGotCalled).toBe(false) // <--- Should be false
          expect(unsubscribeCalled).toBe(true)
          resolve()
        } catch (e) {
          reject(e)
        }
      }, 1500)

    })
  })

  it('Block Producer should gather stake from another block-producer', async () => {
    const accountAddr = '0xffff'
    const witnessAccount = '0x1122'

    let submitBlockGotCalled = false
    const consensusProvider = await getConsensusProvider({
      canSubmitBlock: () => true,
      nextUnhandledRequests: () => {
        return { DEF: true }
      },
      latestBlockHash: () => "100",
      encodeBlock: () => "0x200",
      networkActiveStake: () => new BN(10000),
      activeStakeByPaymentId: {
        [accountAddr]: new BN("4999"),
        [witnessAccount]: new BN("1") // <---- needs 1 more
      },
      onSubmitBlock: (
        agreedStakeBlockHeight: BN,
        previousBlock: string,
        requests: string[],
        supportingData: string, // hash
        responses: Buffer,
        signers: string[],
        sigR: string[],
        sigS: string[],
        sigV: number[]
      ) => {
        submitBlockGotCalled = true
        expect(previousBlock === "100").toBe(true)
        expect(requests.length).toEqual(1)
        expect(supportingData.length).toEqual(64)
        expect(responses.length).toEqual(1)
        expect(responses.equals(Buffer.alloc(1, 1))).toBe(true)
        expect(signers.length).toBe(2)
        expect(signers[0]).toBe(witnessAccount)
        expect(signers[1]).toBe(accountAddr)
        expect(sigR.length).toBe(2)
        expect(sigS.length).toBe(2)
        expect(sigV.length).toBe(2)
        return undefined
      }
    })

    const availableValidatedTransactions = await getAvailableValidatedTransactions([{
      transactionType: 'request-response',
      data: {
        request: {
          request: {
            data: {
              partyOne: ['456'],
              partyTwo: ['789'],
              markers: [],
              direction: 'FORWARD'
            },
            getId: () => 'DEF',
          },
          id: 'DEF'
        },
        response: {},
        answer: true
      }
    }])

    const hashProvider = await getHashingProvider('sha3')
    const nodeNetwork = await getNodeNetwork({
      callbackParams: [{
        publicKey: witnessAccount,
        r: "HALLO",
        s: "HALLO",
        v: 28
      }]
    })

    const ipfs = await getContentService()
    const validator = await getBlockWitnessValidator()

    const producer = new XyoBlockProducer(
      consensusProvider,
      accountAddr,
      availableValidatedTransactions,
      hashProvider,
      nodeNetwork,
      ipfs,
      validator
    )

    producer.start()
    setTimeout(async () => {
      await producer.stop()
      expect(submitBlockGotCalled).toBe(true)
    }, 1500)
  })
})

async function getConsensusProvider(options: {
  canSubmitBlock?: () => boolean,
  latestBlockHash?: () => string,
  encodeBlock?: () => string,
  stakeQuorumPct?: () => number,
  networkActiveStake?: () => BN,
  nextUnhandledRequests?: () => {[s: string]: any},
  signBlock?: () => ISignatureComponents,
  activeStakeByPaymentId?: {[s: string]: BN},
  onSubmitBlock?: (
    agreedStakeBlockHeight: BN,
    previousBlock: string,
    requests: string[],
    supportingData: string, // hash
    responses: Buffer,
    signers: string[],
    sigR: string[],
    sigS: string[],
    sigV: number[]
  ) => string | undefined
}): Promise<IConsensusProvider> {
  // @ts-ignore
  const consensusProvider: IConsensusProvider = {
    getNextUnhandledRequests: async () => {
      return options.nextUnhandledRequests && options.nextUnhandledRequests() || {}
    },
    canSubmitBlock: async () => {
      return (options.canSubmitBlock && options.canSubmitBlock()) || false
    },
    getLatestBlockHash: async () => {
      return (options.latestBlockHash && options.latestBlockHash()) || ""
    },
    encodeBlock: async () => {
      return (options.encodeBlock && options.encodeBlock()) || ""
    },
    getStakeQuorumPct: async () => {
      return (options.stakeQuorumPct && options.stakeQuorumPct()) || 50
    },
    getNetworkActiveStake: async () => {
      return (options.networkActiveStake && options.networkActiveStake()) || new BN(1000)
    },
    signBlock: async () => {
      return (options.signBlock && options.signBlock()) || {
        publicKey: '0xffff',
        sigR: "HELLO_RY",
        sigS: "HELLO_RY",
        sigV: 27,
      }
    },
    getActiveStake: async (paymentId: string) => {
      // console.log(`Payment Id`, paymentId)
      if (options.activeStakeByPaymentId) {
        return options.activeStakeByPaymentId[paymentId]
      }
      return new BN(1000)
    },
    getBlockHeight: async () => {
      return new BN(0)
    },
    getBlockConfirmationTrustThreshold: async () => {
      return 24
    },
    submitBlock: async (
      previousBlock: string,
      agreedStakeBlockHeight: BN,
      requests: string[],
      supportingData: string, // hash
      responses: Buffer,
      signers: string[],
      sigR: string[],
      sigS: string[],
      sigV: number[]
    ) => {
      if (options.onSubmitBlock) {
        const res = options.onSubmitBlock(
          agreedStakeBlockHeight,
          previousBlock,
          requests,
          supportingData,
          responses,
          signers,
          sigR,
          sigS,
          sigV
        )
        if (res) return res
      }
      return "1000000"
    }
  }
  return consensusProvider
}

async function getAvailableValidatedTransactions(
  transactions: Array<IXyoTransaction<any>> // tslint:disable-line:prefer-array-literal
): Promise<IXyoTransactionRepository> {
  // @ts-ignore
  const transactionProvider: IXyoTransactionRepository = {
    list: async () => {
      const l: IXyoMetaList<IXyoTransaction<any>> = {
        meta: {
          totalCount: transactions.length,
          hasNextPage: false,
          endCursor: undefined
        },
        items: transactions
      }
      return l
    },
    find: async (id) => {
      return transactions.find(t => t.data.request.id === id)
    }
  }
  return transactionProvider
}

async function getContentService() {
  return new XyoIpfsClient({
    host: 'ipfs.xyo.network',
    port: '5002',
    protocol: 'https'
  })
}

async function getNodeNetwork(options?: {
  unsubscribe?: () => void,
  // tslint:disable-next-line:prefer-array-literal
  callbackParams?: Array<{publicKey: string, r: string, s: string, v: number}>
}): Promise<IXyoNodeNetwork> {

  // @ts-ignore
  const nodeNetwork: IXyoNodeNetwork = {
    requestSignaturesForBlockCandidate: (dto, cb) => {
      // tslint:disable-next-line:prefer-array-literal
      const cbs: Array<{publicKey: string, r: string, s: string, v: number}> =
        (options && options.callbackParams) || []

      cbs.map((x, index) => {
        setTimeout(() => {
          cb(x.publicKey, { r: x.r, s: x.s, v: x.v })
        }, 100 * index)
      })
      return () => {
        if (options && options.unsubscribe) options.unsubscribe()
      }
    }
  }

  return nodeNetwork
}

async function getBlockWitnessValidator(): Promise<XyoBlockWitnessValidator> {
  // @ts-ignore
  return {
    validate: async () => true
  }
}
