/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 3:47:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th February 2019 4:40:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:no-object-literal-type-assertion

// tslint:disable-next-line:no-reference
/// <reference path="./@types/merge.d.ts" />
import merge from 'merge'

import { IXyoProvider, IXyoProviderContainer, IXyoResolvers, depScope } from "./@types"
import { CatalogueItem } from "@xyo-network/network"
import { IXyoNodeRunnerDelegate } from "@xyo-network/node-runner"
import { createDirectoryIfNotExists, LifeCycleRunner, BaseLifeCyclable } from "@xyo-network/utils"
import { resolvers } from './resolvers'
import { IResolvers } from "./xyo-resolvers-enum"
import { XyoError, XyoErrors } from "@xyo-network/errors"
import { ProcessManager } from "./process-manager"
import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { XyoOriginChainStateInMemoryRepository } from '@xyo-network/origin-chain'

export const DEFAULT_NODE_OPTIONS: IXyoNodeOptions = {
  modules: resolvers,
  config: {
    data: {
      path: './node-db'
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
    boundWitnessValidator: {
      checkPartyLengths: true,
      checkIndexExists: true,
      checkCountOfSignaturesMatchPublicKeysCount: true,
      validateSignatures: true,
      validateHash: true
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
    [IResolvers.NODE_RUNNER_DELEGATE]: 'singleton',
    [IResolvers.NODE_NETWORK]: 'singleton',
    [IResolvers.P2P_SERVICE]: 'singleton',
    [IResolvers.DISCOVERY_NETWORK]: 'singleton',
    [IResolvers.PEER_TRANSPORT]: 'singleton',
    [IResolvers.TRANSACTION_REPOSITORY]: 'singleton'
  }

  private cachedModules: {[r: string]: any} = {}

  /** Some instance variables for managing the xyo-node loop */
  private isLooping = false
  private shouldStopLooping = false

  // @ts-ignore
  private opts: IXyoNodeOptions
  private delegate: IXyoNodeRunnerDelegate | undefined

  constructor (private readonly options?: PartialNodeOptions) {
    super()
  }

  public async initialize() {
    this.logInfo(`${this.constructor.name}:initialize`)

    await this.resolveOptions()
    await this.createDataDirectory(this.opts)
    this.delegate = await this.get<IXyoNodeRunnerDelegate>(IResolvers.NODE_RUNNER_DELEGATE)
    this.eventEmitter.emit('initialized')
  }

  public async start() {
    this.logInfo(`${this.constructor.name}:started`)
    this.loop()
    this.eventEmitter.emit('started')
  }

  public async stop() {
    this.logInfo(`${this.constructor.name}:stopped`)
    this.shouldStopLooping = true

    if (this.delegate) {
      return this.delegate.onStop()
    }

    this.eventEmitter.emit('stopped')
    return
  }

  public async get<T>(provider: IResolvers): Promise<T> {
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

  public hasDependency(provider: IResolvers): boolean {
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

  private async loop() {
    if ((this.isLooping && this.shouldStopLooping) || !this.delegate) {
      return
    }

    try {
      await this.delegate.run()
    } catch (err) {
      this.logError(`There was an uncaught error in the xyo-node loop`, err)
    }

    setImmediate(this.loop.bind(this))
  }

  private async resolveOptions() {
    if (!this.options) {
      this.opts = DEFAULT_NODE_OPTIONS
    }

    this.opts = merge.recursive(DEFAULT_NODE_OPTIONS, this.options)
  }

  private async createDataDirectory(nodeOptions: PartialNodeOptions) {
    let dataPath = './node-db'
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

export interface IXyoTCPBoundWitnessConfig {
  serverPort: number,
}

export interface IXyoBoundWitnessConfig {
  catalogue: CatalogueItem[],
  tcp: IXyoTCPBoundWitnessConfig
}

export interface IXyoDataConfig {
  path: string
}

export interface IXyoNodeConfig {
  [key: string]: any
  data: IXyoDataConfig
}

export interface IXyoNodeOptions {
  modules: Partial<IXyoResolvers>
  config: IXyoNodeConfig
}

export type PartialNodeOptions = Partial<IXyoNodeOptions>

export async function main() {
  const newNode = new XyoNode({
    config: {
      data: {
        path: './node-db-1'
      },
      originChainRepository: {
        data: './node-db-1/origin-chain'
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
      }
    }
  })

  const managedProcessNode = new ProcessManager(newNode)
  managedProcessNode.manage(process)
}

if (require.main === module) {
  main()
}
