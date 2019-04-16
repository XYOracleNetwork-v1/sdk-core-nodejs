import { BaseLifeCyclable, IXyoProviderContainer, depScope, IXyoRunnable, IXyoProvider, createDirectoryIfNotExists } from "@xyo-network/utils"
import { IResolvers } from "./xyo-resolvers-enum"
import { PartialNodeOptions } from "./@types"
import { XyoError } from "@xyo-network/errors"
import { XyoBase } from "@xyo-network/base"
import merge from 'merge'
import path from 'path'
import { DEFAULT_NODE_OPTIONS } from "./default-node-options"

export class XyoNodeLifeCycle extends BaseLifeCyclable implements IXyoProviderContainer {

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
    [IResolvers.ARCHIVIST_REPOSITORY_SQL]: 'singleton',
    [IResolvers.ARCHIVIST_REPOSITORY_DYNAMO]: 'singleton',
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
