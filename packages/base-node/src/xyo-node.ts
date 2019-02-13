/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 3:47:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th February 2019 1:34:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoProvider, IXyoProviderContainer, IXyoResolvers, depScope } from "./@types"
import { CatalogueItem } from "@xyo-network/network"
import { IXyoNodeRunnerDelegate, XyoNodeRunner } from "@xyo-network/node-runner"
import { createDirectoryIfNotExists, LifeCycleRunner, BaseLifeCyclable } from "@xyo-network/utils"
import { resolvers } from './resolvers'
import { IResolvers } from "./xyo-resolvers-enum"
import { XyoError, XyoErrors } from "@xyo-network/errors"

export const DEFAULT_NODE_OPTIONS: IXyoNodeOptions = {
  modules: resolvers,
  config: {
    data: {
      path: './node-db'
    },
    boundWitness: {
      catalogue: [
        CatalogueItem.BOUND_WITNESS,
        CatalogueItem.GIVE_ORIGIN_CHAIN,
        CatalogueItem.GIVE_REQUESTED_BLOCKS,
        CatalogueItem.TAKE_ORIGIN_CHAIN,
        CatalogueItem.TAKE_REQUESTED_BLOCKS,
      ],
      tcp: {
        serverPort: 11000
      }
    }
  }
}

class XyoNodeLifeCycle extends BaseLifeCyclable implements IXyoProviderContainer {

  private nodeRunner: XyoNodeRunner | undefined

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
    [IResolvers.TRANSACTION_REPOSITORY]: 'singleton'
  }

  private cachedModules: {[r: string]: any} = {}

  // @ts-ignore
  private readonly resolvedOptions: IXyoNodeOptions

  constructor (private readonly options?: PartialNodeOptions) {
    super()
  }

  public async initialize() {
    await this.resolveOptions()
    await this.createDataDirectory(this.resolvedOptions)
  }

  public async start() {
    const delegate = await this.get<IXyoNodeRunnerDelegate>(IResolvers.NODE_RUNNER_DELEGATE)
    this.nodeRunner = new XyoNodeRunner(delegate)
    await this.nodeRunner.start()
  }

  public async stop() {
    if (this.nodeRunner) {
      await this.nodeRunner.stop()
    }

    return
  }

  public async get<T>(provider: IResolvers): Promise<T> {
    const hasDependency = this.hasDependency(provider)
    if (!hasDependency) {
      throw new XyoError(`Could not resolve dependency ${provider}`, XyoErrors.CRITICAL)
    }

    const resolvedRecipe = this.resolvedOptions.modules[provider] as unknown as IXyoProvider<T, any, any>
    const instanceLifeCycle = this.instanceLifeCycleMap[provider]

    if (instanceLifeCycle === 'singleton') {
      const cachedModule = this.cachedModules[provider]
      if (cachedModule === null) {
        throw new XyoError(`Circular dependency detected for provider ${provider}`, XyoErrors.CRITICAL)
      }

      if (cachedModule) return cachedModule as T
    }

    this.cachedModules[provider] = null
    const resolvedModule = await this.resolveProvider<T>(provider).get(this)

    if (!resolvedModule) {
      throw new XyoError(`Could not resolve module ${provider}`, XyoErrors.CRITICAL)
    }

    this.cachedModules[provider] = (instanceLifeCycle === 'singleton') ? resolvedModule : undefined

    if (resolvedRecipe.initialize) {
      // @ts-ignore
      const config = this.resolvedOptions.config[provider]
      await resolvedRecipe.initialize(resolvedModule, this, config)
    }

    return resolvedModule
  }

  public hasDependency(provider: IResolvers): boolean {
    const recipe = this.resolvedOptions.modules[provider]
    const instanceLifeCycle = this.instanceLifeCycleMap[provider]
    if (!recipe || !instanceLifeCycle) {
      return false
    }

    return true
  }

  public register<T, C, I>(dep: IResolvers, provider: IXyoProvider<T, C, I>, scope: depScope): void {
    if (this.cachedModules[dep] !== undefined) {
      throw new XyoError(`This module has already been resolved, can not be re-registered safely`, XyoErrors.CRITICAL)
    }

    // @ts-ignore
    this.resolvedOptions.modules[dep] = provider
    this.instanceLifeCycleMap[dep] = scope
  }

  private resolveProvider<T>(provider: IResolvers): IXyoProvider<T, any, any> {
    // @ts-ignore
    return undefined
  }

  private async resolveOptions() {
    // @ts-ignore
    return undefined
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
  data: IXyoDataConfig
  boundWitness: IXyoBoundWitnessConfig
}

export interface IXyoNodeOptions {
  modules: Partial<IXyoResolvers>
  config: IXyoNodeConfig
}

export type PartialNodeOptions = Partial<IXyoNodeOptions>

export async function main() {
  const newNode = new XyoNode()
  await newNode.initialize()
  await newNode.start()
}

if (require.main === module) {
  main()
}
