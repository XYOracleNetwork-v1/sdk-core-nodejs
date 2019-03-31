
export {
  unsubscribeFn,
  Callback,
  IXyoRepository,
  asyncPureFn,
  parameterizedFactoryFn,
  parameterizedProviderFn,
  providerFn,
  pureFn,
  IFactory,
  IParameterizedFactory,
  IParameterizedProvider,
  IProvider,
  factoryFn,
  IInitializable,
  ILifeCyclable,
  IRunnable,
  ILifeCycleEvent,
  IXyoProvider,
  IXyoProviderContainer,
  depScope,
  IRepoItem
} from './@types'

export { CurrentValue } from './value'
export { Subscribe } from './subscribe'
export { ProcessManager } from './process-manager'

/// <reference path="./@types/bs58.d.ts" />
import bs58 from 'bs58'
import BigNumber = require('bn.js')
export { BigNumber as BN }

import { promisify } from "util"
import fs from 'fs'
import { ILifeCyclable, ILifeCycleEvent, asyncPureFn, IXyoRepository, parameterizedFactoryFn } from './@types'
import { XyoBase } from '@xyo-network/base'
import { EventEmitter } from 'events'
import { XyoError, XyoErrors } from '@xyo-network/errors'

const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

import path from 'path'

/**
 * Recursively builds directory from a path
 *
 * @export
 * @param {string} p
 */
export async function createDirectoryIfNotExists(p: string) {
  try {
    await stat(p)
  } catch (err) {
    if (err.code && err.code === 'ENOENT') {
      try {
        await mkdir(p, null)
      } catch (e2) {
        if (e2.code !== 'ENOENT') {
          throw e2
        }

        const pathParts = path.parse(p)
        if (pathParts.dir === pathParts.root) {
          throw e2
        }

        await createDirectoryIfNotExists(pathParts.dir)
        await createDirectoryIfNotExists(p)
      }
    }
  }
}

export const readFile = promisify(fs.readFile)
export const writeFile = promisify(fs.writeFile)

export interface IXyoRunnable {
  type: 'daemon' | 'loop' | 'task'
  getSleepTime(): number
  run(): Promise<void>
  stop(): Promise<void>
}

export class BaseLifeCyclable extends XyoBase implements ILifeCyclable {

  protected readonly eventEmitter: EventEmitter

  constructor(private readonly partialImplementation?: Partial<ILifeCycleEvent>) {
    super()
    this.eventEmitter = new EventEmitter()
  }

  public async preInitialize(): Promise<void> {
    if (this.partialImplementation && this.partialImplementation.onPreInitialize) {
      await this.partialImplementation.onPreInitialize()
    }

    this.eventEmitter.emit('pre:initialized')
  }

  public async initialize(): Promise<void> {
    if (this.partialImplementation && this.partialImplementation.onInitialize) {
      await this.partialImplementation.onInitialize()
    }

    this.eventEmitter.emit('initialized')
  }

  public async postInitialize(): Promise<void> {
    if (this.partialImplementation && this.partialImplementation.onPostInitialize) {
      await this.partialImplementation.onPostInitialize()
    }

    this.eventEmitter.emit('post:initialized')
  }

  public async preStart(): Promise<void> {
    if (this.partialImplementation && this.partialImplementation.onPreStart) {
      await this.partialImplementation.onPreStart()
    }

    this.eventEmitter.emit('pre:started')
  }

  public async start(): Promise<void> {
    if (this.partialImplementation && this.partialImplementation.onStart) {
      await this.partialImplementation.onStart()
    }

    this.eventEmitter.emit('started')
  }

  public async postStart(): Promise<void> {
    if (this.partialImplementation && this.partialImplementation.onPostStart) {
      await this.partialImplementation.onPostStart()
    }

    this.eventEmitter.emit('post:started')
  }

  public async preStop(): Promise<void> {
    if (this.partialImplementation && this.partialImplementation.onPreStop) {
      await this.partialImplementation.onPreStop()
    }

    this.eventEmitter.emit('pre:stopped')
  }

  public async stop(): Promise<void> {
    if (this.partialImplementation && this.partialImplementation.onStop) {
      await this.partialImplementation.onStop()
    }

    this.eventEmitter.emit('stopped')
  }

  public async postStop(): Promise<void> {
    if (this.partialImplementation && this.partialImplementation.onPostStop) {
      await this.partialImplementation.onPostStop()
    }

    this.eventEmitter.emit('post:stopped')
  }

  public on(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.on(event, listener)
    return this
  }

  public once(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.once(event, listener)
    return this
  }

  public off(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.off(event, listener)
    return this
  }

  public removeAllListeners(event: string | undefined) {
    this.eventEmitter.removeAllListeners(event)
    return this
  }
}

// tslint:disable-next-line:max-classes-per-file
export class LifeCycleBuilder {
  private readonly builder: Partial<ILifeCycleEvent> = {}

  public onPreInitialize(fn: asyncPureFn<void>) {
    this.builder.onPreInitialize = fn
    return this
  }

  public onInitialize(fn: asyncPureFn<void>) {
    this.builder.onInitialize = fn
    return this
  }

  public onPostInitialize(fn: asyncPureFn<void>) {
    this.builder.onPostInitialize = fn
    return this
  }

  public onPreStart(fn: asyncPureFn<void>) {
    this.builder.onPreStart = fn
    return this
  }

  public onStart(fn: asyncPureFn<void>) {
    this.builder.onStart = fn
    return this
  }

  public onPostStart(fn: asyncPureFn<void>) {
    this.builder.onPostStart = fn
    return this
  }

  public onPreStop(fn: asyncPureFn<void>) {
    this.builder.onPreStop = fn
    return this
  }

  public onStop(fn: asyncPureFn<void>) {
    this.builder.onStop = fn
    return this
  }

  public onPostStop(fn: asyncPureFn<void>) {
    this.builder.onPostStop = fn
    return this
  }

  public build() {
    return new BaseLifeCyclable(this.builder)
  }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class XyoDaemon extends XyoBase {

  private resolveStopLoopingPromise?: () => void
  private unscheduleTimeout: (() => void) | undefined
  private looping = false

  public async start(): Promise<void> {
    this.logInfo("Starting Daemon!")
    return this.runner(3000)
  }

  public async stop(): Promise<void> {
    if (this.unscheduleTimeout) this.unscheduleTimeout()
    this.unscheduleTimeout = undefined

    return new Promise((resolve, reject) => {
      if (!this.looping) {
        return resolve()
      }

      this.resolveStopLoopingPromise = resolve
    })
  }

  protected abstract run(): Promise<void> | void

  protected delayRun(currentValue: number, errorOccurred: boolean): number | undefined {
    return errorOccurred ? currentValue * 2 : 3000 // exponential back-off
  }

  protected shouldStop(): boolean {
    return this.resolveStopLoopingPromise !== undefined
  }

  private async runner(timeout: number) {
    this.looping = true
    let errorOccurred = false

    if (this.shouldStop()) {
      if (this.resolveStopLoopingPromise) {
        this.resolveStopLoopingPromise()
        this.resolveStopLoopingPromise = undefined
      }
      this.looping = false
      return
    }

    try {
      const runReq = this.run()
      if (runReq !== undefined) {
        await runReq
      }
    } catch (err) {
      this.logError(`There was an error in the block-producer loop`, err)
      errorOccurred = true
    }

    if (this.shouldStop()) {
      if (this.resolveStopLoopingPromise) {
        this.resolveStopLoopingPromise()
        this.resolveStopLoopingPromise = undefined
      }

      this.looping = false
      return
    }

    const delay = this.delayRun(timeout, errorOccurred)
    if (delay === undefined) {
      this.looping = false
      return
    }

    this.looping = false
    this.unscheduleTimeout = XyoBase.timeout(() => this.runner(delay), delay)
  }
}

// tslint:disable-next-line:max-classes-per-file
export class LifeCycleRunner {
  public state:
    undefined
    | null
    | 'pre:initialized'
    | 'initialized'
    | 'post:initialized'
    | 'pre:started'
    | 'started'
    | 'post:started'
    | 'pre:stopped'
    | 'stopped'
    | 'post:stopped' = undefined

  constructor(public readonly lifeCyclable: ILifeCyclable) {}

  public async initialize(): Promise<void> {
    if (!this.canInitialize()) {
      throw new XyoError(`Already initialized, can not initialize again`)
    }

    this.state = null
    await this.lifeCyclable.preInitialize()
    this.state = 'pre:initialized'

    await this.lifeCyclable.initialize()
    this.state = 'initialized'

    await this.lifeCyclable.postInitialize()
    this.state = 'post:initialized'
  }

  public async start(): Promise<void> {
    if (!this.canStart()) {
      throw new XyoError(`Not yet initialized, can not start`)
    }

    await this.lifeCyclable.preStart()
    this.state = 'pre:started'

    await this.lifeCyclable.start()
    this.state = 'started'

    await this.lifeCyclable.postStart()
    this.state = 'post:started'
  }

  public async stop(): Promise<void> {
    if (!this.canStop()) {
      throw new XyoError(`Not yet started, can not stop`)
    }

    await this.lifeCyclable.preStop()
    this.state = 'pre:stopped'

    await this.lifeCyclable.stop()
    this.state = 'stopped'

    await this.lifeCyclable.postStop()
    this.state = 'post:stopped'
  }

  public canInitialize() {
    return this.state === undefined
  }

  public canStart() {
    return this.state === 'post:initialized'
  }

  public canStop() {
    return this.state === 'post:started'
  }
}

export const base58 = {
  encode: (b: Buffer) => bs58.encode(b),
  decode: (hex: string) => bs58.decode(hex)
}

export async function fileExists(pathToFile: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      fs.access(pathToFile, fs.constants.F_OK, (err) => {
        resolve(!Boolean(err))
      })
    } catch (ex) {
      reject(ex)
    }
  })
}

// tslint:disable-next-line:max-classes-per-file
export class XyoPair<K, V> {
  constructor(public readonly k: K, public readonly v: V) {}
}
