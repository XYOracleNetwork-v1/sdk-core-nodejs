import { IXyoNodeOptions } from "./@types"
import { resolvers } from "./resolvers"

import path from 'path'
import { CatalogueItem } from "@xyo-network/network"

export const DEFAULT_NODE_OPTIONS: IXyoNodeOptions = {
  modules: resolvers,
  config: {
    nodeRunnerDelegates: {
      enableBoundWitnessServer: true,
      enableGraphQLServer: true,
      enableQuestionsWorker: true,
      enableBlockProducer: true,
      enableBlockWitness: true
    },
    blockProducer: {
      accountAddress: '0x123'
    },
    blockWitness: {

    },
    data: {
      path: path.resolve('node-db')
    },
    discovery: {
      bootstrapNodes: [],
      publicKey: 'abc',
      address: '/ip4/0.0.0.0/tcp/11500'
    },
    peerTransport: {
      address: '/ip4/0.0.0.0/tcp/11500'
    },
    nodeNetworkFrom: {
      shouldServiceBlockPermissionRequests: true,
      features: {}
    },
    network: {
      port: 11000
    },
    originChainRepository: {
      data: './node-db/origin-chain'
    },
    networkProcedureCatalogue: {
      catalogue: [
        CatalogueItem.BOUND_WITNESS,
        CatalogueItem.TAKE_ORIGIN_CHAIN,
        CatalogueItem.GIVE_ORIGIN_CHAIN,
        CatalogueItem.TAKE_REQUESTED_BLOCKS,
        CatalogueItem.GIVE_REQUESTED_BLOCKS
      ]
    },
    archivistRepository: {
      host: '127.0.0.1',
      user: 'admin',
      password: 'password',
      database: 'Xyo',
      port: 3306
    },
    boundWitnessValidator: {
      checkPartyLengths: true,
      checkIndexExists: true,
      checkCountOfSignaturesMatchPublicKeysCount: true,
      validateSignatures: true,
      validateHash: true
    },
    aboutMeService: {
      ip: '127.0.0.1',
      boundWitnessServerPort: 11000,
      graphqlPort: 11001,
      version: '0.23.0',
      name: `Ryan's Node`
    },
    graphql: {
      port: 11001,
      apis: {
        about: true,
        blockByHash: true,
        entities: true,
        blockList: true,
        blocksByPublicKey: true,
        intersections: true,
        transactionList: true
      }
    },
    web3Service: {
      host: 'https://kovan.infura.io/v3/8f1e6c44394f4366a49095d9cac828e2',
      address: '0xff710bF860e6D8e4a2b1E2023C1283e890017CDb',
      privateKey: '5408C9896DD9F6EC03DF446E2FE3909AE7DF18A0B3FA7029DD793379B94FB2BA',
      contracts: {
        XyStakingConsensus: {
          ipfsHash: "QmRpytEw449ujLTQzRmyHNoJpYvDtWKktfhKZAciizZYG4",
          address: '0xBFd89f65C0F7B600e720EC3Cd7Ef392424351f6F',
        }, XyBlockProducer: {
          ipfsHash: "QmR9yrmMGGzE5nqHPGxbkBYNvVHnVG8csfJVZtkgWSbeEX",
          address: '0x6797aceC0E47B7849CDc8F7B5546777681C1d4D1',
        }, XyGovernance: {
          ipfsHash: "QmT3zhyoWJ7MA9nqpVP8pSiBaVs5MTqQ2mNNHZ2LbYismQ",
          address: '0x98d1Df3A49Defd8b28e9Feb71d1c7370457643f0',
        }
      }
    },
    contentAddressableService: {
      host: 'ipfs.xyo.network',
      port: 5002,
      protocol: 'https'
    },
    transactionRepository: {
      data: './node-db/transactions'
    }
  }
}
