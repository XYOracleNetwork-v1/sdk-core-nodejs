/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 3:47:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 19th February 2019 2:01:07 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:no-object-literal-type-assertion

// tslint:disable-next-line:no-reference
/// <reference path="./@types/merge.d.ts" />
import merge from 'merge'

import { PartialNodeOptions, IXyoNodeOptions } from "./@types"
import { CatalogueItem } from "@xyo-network/network"
import { IXyoNodeRunnerDelegate } from "@xyo-network/node-runner"
import path from 'path'
import {
  createDirectoryIfNotExists,
  LifeCycleRunner, BaseLifeCyclable,
  IXyoProvider,
  IXyoProviderContainer,
  depScope,
  ProcessManager
} from "@xyo-network/utils"
import { resolvers } from './resolvers'
import { IResolvers } from "./xyo-resolvers-enum"
import { XyoError, XyoErrors } from "@xyo-network/errors"
import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { XyoOriginChainStateInMemoryRepository } from '@xyo-network/origin-chain'

export const DEFAULT_NODE_OPTIONS: IXyoNodeOptions = {
  modules: resolvers,
  config: {
    nodeRunnerDelegates: {
      enableBoundWitnessServer: true,
      enableGraphQLServer: true,
      enableQuestionsWorker: true
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
    nodeNetwork: {
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
      host: 'http://127.0.0.1:8545',
      address: 'abc',
      contracts: {
        PayOnDelivery: {
          address: 'need to be replaced'
        }
      }
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
    [IResolvers.NODE_RUNNER_DELEGATES]: 'singleton',
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
    [IResolvers.WEB3_SERVICE]: 'singleton'
  }

  private cachedModules: {[r: string]: any} = {}

  /** Some instance variables for managing the xyo-node loop */
  private isLooping = false
  private shouldStopLooping = false

  // @ts-ignore
  private opts: IXyoNodeOptions
  private delegates: IXyoNodeRunnerDelegate[] | undefined

  constructor (private readonly options?: PartialNodeOptions) {
    super()
  }

  public async initialize() {
    this.logInfo(`${this.constructor.name}:initialize`)

    await this.resolveOptions()
    await this.createDataDirectory(this.opts)
    this.delegates = await this.get<IXyoNodeRunnerDelegate[]>(IResolvers.NODE_RUNNER_DELEGATES)
    this.eventEmitter.emit('initialized')
  }

  public async start() {
    this.logInfo(`${this.constructor.name}:started`)
    if (!this.delegates) {
      throw new XyoError(`No delegates to start`, XyoErrors.CRITICAL)
    }
    await Promise.all(this.delegates.map(d => this.loop(d)))
    this.eventEmitter.emit('started')
  }

  public async stop() {
    this.logInfo(`${this.constructor.name}:stopped`)
    this.shouldStopLooping = true

    if (this.delegates) {
      await Promise.all(this.delegates.map(d => d.onStop()))
      return
    }

    this.eventEmitter.emit('stopped')
    return
  }

  public async get<T>(provider: string): Promise<T> {
    const hasDependency = this.hasDependency(provider)
    if (!hasDependency) {
      throw new XyoError(`Could not resolve dependency ${provider}`, XyoErrors.CRITICAL)
    }

    const resolvedRecipe = this.opts.modules[provider] as unknown as IXyoProvider<T, any>
    const instanceLifeCycle = this.instanceLifeCycleMap[provider]

    if (instanceLifeCycle === 'singleton') {
      const cachedModule = this.cachedModules[provider]
      if (cachedModule === null) {
        throw new XyoError(`Circular dependency detected for provider ${provider}`, XyoErrors.CRITICAL)
      }

      if (cachedModule) return cachedModule as T
    }

    this.cachedModules[provider] = null

    // @ts-ignore
    const resolvedModule = await resolvedRecipe.get(this, this.opts.config[provider])

    if (!resolvedModule) {
      throw new XyoError(`Could not resolve module ${provider}`, XyoErrors.CRITICAL)
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
      throw new XyoError(`This module has already been resolved, can not be re-registered safely`, XyoErrors.CRITICAL)
    }

    // @ts-ignore
    this.opts.modules[dep] = provider
    this.instanceLifeCycleMap[dep] = scope
  }

  private async loop(delegate: IXyoNodeRunnerDelegate) {
    if ((this.isLooping && this.shouldStopLooping) || !delegate) {
      return
    }

    try {
      await delegate.run()
    } catch (err) {
      this.logError(`There was an uncaught error in the xyo-node loop`, err)
    }

    setImmediate(() => {
      this.loop(delegate)
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

    this.logInfo(`Setting Data Directory to ${dataPath}`)
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

  public async get<T>(provider: IResolvers): Promise<T> {
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
    },
    modules: {
      [IResolvers.ORIGIN_CHAIN_REPOSITORY]: {
        get: async (container, config) => {
          const originBlockRepo = await container.get<IXyoOriginBlockRepository>(IResolvers.ORIGIN_BLOCK_REPOSITORY)
          const serializationService = await container.get<IXyoSerializationService>(IResolvers.SERIALIZATION_SERVICE)

          return new XyoOriginChainStateInMemoryRepository(
            0, // index
            [], // hashes
            [], // public keys
            originBlockRepo,
            [],
            undefined, // next-public-key
            [], // waiting signers
            serializationService,
            undefined // genesis signer
          )
        }
      },
    }
  })

  const managedProcessNode = new ProcessManager(newNode)
  managedProcessNode.manage(process)
}

if (require.main === module) {
  main()
}
