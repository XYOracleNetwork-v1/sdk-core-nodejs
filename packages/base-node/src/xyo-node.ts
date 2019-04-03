/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 3:47:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th March 2019 4:07:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:no-object-literal-type-assertion

// tslint:disable-next-line:no-reference
/// <reference path="./@types/merge.d.ts" />
import merge from 'merge'

import { PartialNodeOptions, IXyoNodeOptions } from "./@types"
import { CatalogueItem } from "@xyo-network/network"
import path from 'path'
import {
  createDirectoryIfNotExists,
  LifeCycleRunner, BaseLifeCyclable,
  IXyoProvider,
  IXyoProviderContainer,
  depScope,
  ProcessManager,
  IXyoRunnable
} from "@xyo-network/utils"
import { resolvers } from './resolvers'
import { IResolvers } from "./xyo-resolvers-enum"
import { XyoError } from "@xyo-network/errors"
import { XyoBase } from '@xyo-network/base'

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

class XyoNodeLifeCycle extends BaseLifeCyclable implements IXyoProviderContainer {

  private instanceLifeCycleMap: {[s: string]: depScope} = {
    [IResolvers.SIGNERS]: 'singleton',
    [IResolvers.SERIALIZATION_SERVICE]: 'singleton',
    [IResolvers.HASH_PROVIDER]: 'singleton',
    [IResolvers.ORIGIN_CHAIN_REPOSITORY]: 'singleton',
    [IResolvers.ORIGIN_BLOCK_REPOSITORY]: 'singleton',
    [IResolvers.BOUND_WITNESS_PAYLOAD_PROVIDER]: 'transient',
    [IResolvers.BOUND_WITNESS_SUCCESS_LISTENER]: 'singleton',
    [IResolvers.BOUND_WITNESS_VALIDATOR]: 'singleton',
    [IResolvers.NETWORK_PROCEDURE_CATALOGUE]: 'singleton',
    [IResolvers.NETWORK]: 'singleton',
    [IResolvers.PEER_CONNECTION_DELEGATE]: 'singleton',
    [IResolvers.RUNNABLES]: 'singleton',
    [IResolvers.NODE_NETWORK_FROM]: 'singleton',
    [IResolvers.P2P_SERVICE]: 'singleton',
    [IResolvers.DISCOVERY_NETWORK]: 'singleton',
    [IResolvers.PEER_TRANSPORT]: 'singleton',
    [IResolvers.TRANSACTION_REPOSITORY]: 'singleton',
    [IResolvers.ARCHIVIST_REPOSITORY]: 'singleton',
    [IResolvers.GRAPHQL]: 'singleton',
    [IResolvers.ABOUT_ME_SERVICE]: 'singleton',
    [IResolvers.ARCHIVIST_NETWORK]: 'singleton',
    [IResolvers.QUESTION_SERVICE]: 'singleton',
    [IResolvers.QUESTIONS_PROVIDER]: 'singleton',
    [IResolvers.WEB3_SERVICE]: 'singleton',
    [IResolvers.CONTENT_ADDRESSABLE_SERVICE]: 'singleton',
    [IResolvers.CONSENSUS_PROVIDER]: 'singleton',
    [IResolvers.BLOCK_PRODUCER]: 'singleton',
    [IResolvers.BLOCK_WITNESS]: 'singleton',
  }

  private cachedModules: {[r: string]: any} = {}

  // @ts-ignore
  private opts: IXyoNodeOptions
  private delegates: IXyoRunnable[] | undefined

  constructor (private readonly options?: PartialNodeOptions) {
    super()
  }

  public async initialize() {
    await this.resolveOptions()
    await this.createDataDirectory(this.opts)

    this.delegates = await this.get<IXyoRunnable[]>(IResolvers.RUNNABLES)
    this.eventEmitter.emit('initialized')
  }

  public async start() {
    if (!this.delegates) {
      throw new XyoError(`No delegates to start`)
    }

    this.delegates.map(async (runnable, index) => {
      this.run(runnable)
    })

    this.eventEmitter.emit('started')
  }

  public async stop() {
    this.logInfo(`${this.constructor.name}:stopped`)

    XyoBase.unschedule()

    if (this.delegates) {
      await Promise.all(this.delegates.map(d => d.stop()))
      return
    }

    this.eventEmitter.emit('stopped')
    return
  }

  public async get<T>(provider: string): Promise<T> {
    const hasDependency = this.hasDependency(provider)
    if (!hasDependency) {
      throw new XyoError(`Could not resolve dependency ${provider}`)
    }

    const resolvedRecipe = this.opts.modules[provider] as unknown as IXyoProvider<T, any>
    const instanceLifeCycle = this.instanceLifeCycleMap[provider]

    if (instanceLifeCycle === 'singleton') {
      const cachedModule = this.cachedModules[provider]
      if (cachedModule === null) {
        throw new XyoError(`Circular dependency detected for provider ${provider}`)
      }

      if (cachedModule)return cachedModule as T
    }

    this.cachedModules[provider] = null

    // @ts-ignore
    const resolvedModule = await resolvedRecipe.get(this, this.opts.config[provider])

    if (!resolvedModule) {
      throw new XyoError(`Could not resolve module ${provider}`)
    }

    this.cachedModules[provider] = (instanceLifeCycle === 'singleton') ? resolvedModule : undefined
    if (resolvedRecipe.postInit) {
      await resolvedRecipe.postInit(resolvedModule, this, this.opts.config[provider])
    }

    return resolvedModule
  }

  public hasDependency(provider: string): boolean {
    const recipe = this.opts.modules[provider]
    const instanceLifeCycle = this.instanceLifeCycleMap[provider]
    if (!recipe || !instanceLifeCycle) {
      return false
    }

    return true
  }

  public register<T, C>(dep: IResolvers, provider: IXyoProvider<T, C>, scope: depScope): void {
    if (this.cachedModules[dep] !== undefined) {
      throw new XyoError(`This module has already been resolved, can not be re-registered safely`)
    }

    // @ts-ignore
    this.opts.modules[dep] = provider
    this.instanceLifeCycleMap[dep] = scope
  }

  private run(runnable: IXyoRunnable) {
    XyoBase.immediate(async () => {
      try {
        await runnable.run()
      } catch (e) {
        this.logError(`There was an error in runnable`, e)
      }

      if (runnable.type === 'loop') {
        XyoBase.timeout(async () => {
          this.run(runnable)
        }, runnable.getSleepTime())
      }
    })
  }

  private async resolveOptions() {
    if (!this.options) {
      this.opts = DEFAULT_NODE_OPTIONS
    }

    this.opts = merge.recursive(DEFAULT_NODE_OPTIONS, this.options)
  }

  private async createDataDirectory(nodeOptions: PartialNodeOptions) {
    let dataPath = path.resolve('node-db')
    if (
      nodeOptions &&
      nodeOptions.config &&
      nodeOptions.config.data &&
      nodeOptions.config.data.path
    ) {
      dataPath = nodeOptions.config.data.path
    }

    await createDirectoryIfNotExists(dataPath)
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoNode extends LifeCycleRunner {

  constructor (private readonly nodeOptions?: Partial<IXyoNodeOptions>) {
    super(new XyoNodeLifeCycle(nodeOptions))
  }

  public register<T, C>(dep: IResolvers, provider: IXyoProvider<T, C>, scope: depScope): void {
    return (this.lifeCyclable as XyoNodeLifeCycle).register<T, C>(dep, provider, scope)
  }

  public hasDependency(provider: IResolvers): boolean {
    return (this.lifeCyclable as XyoNodeLifeCycle).hasDependency(provider)
  }

  public async get<T>(provider: IResolvers, n: number): Promise<T> {
    return (this.lifeCyclable as XyoNodeLifeCycle).get<T>(provider)
  }
}

export async function main() {
  const newNode = new XyoNode({
    config: {
      data: {
        path: './node-db'
      },
      originChainRepository: {
        data: './node-db/origin-chain'
      }
    }
  })

  const managedProcessNode = new ProcessManager(newNode)
  managedProcessNode.manage(process)
}

if (require.main === module) {
  main()
}
