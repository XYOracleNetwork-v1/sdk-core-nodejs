
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
  IRunnable
} from './@types'

import { promisify } from "util"
import fs from 'fs'
import { ILifeCyclable, ILifeCycleEvent, asyncPureFn } from './@types'
import { XyoBase } from '@xyo-network/base'
import { EventEmitter } from 'events'
import { XyoError, XyoErrors } from '@xyo-network/errors'

const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

export async function createDirectoryIfNotExists(path: string) {
  try {
    await stat(path)
  } catch (err) {
    if (err.code && err.code === 'ENOENT') {
      await mkdir(path, null)
    }
  }
}

export class BaseLifeCyclable extends XyoBase implements ILifeCyclable {

  private readonly eventEmitter: EventEmitter

  constructor(private readonly partialImplementation?: Partial<ILifeCycleEvent>) {
    super()
    this.eventEmitter = new EventEmitter()
  }

  public async preInitialize(): Promise<void> {
    this.logInfo(`${this.constructor.name}:pre:initialize`)
    if (this.partialImplementation && this.partialImplementation.onPreInitialize) {
      await this.partialImplementation.onPreInitialize()
    }

    this.eventEmitter.emit('pre:initialized')
  }

  public async initialize(): Promise<void> {
    this.logInfo(`${this.constructor.name}:initialize`)
    if (this.partialImplementation && this.partialImplementation.onInitialize) {
      await this.partialImplementation.onInitialize()
    }

    this.eventEmitter.emit('initialized')
  }

  public async postInitialize(): Promise<void> {
    this.logInfo(`${this.constructor.name}:post:initialize`)

    if (this.partialImplementation && this.partialImplementation.onPostInitialize) {
      await this.partialImplementation.onPostInitialize()
    }

    this.eventEmitter.emit('post:initialized')
  }

  public async preStart(): Promise<void> {
    this.logInfo(`${this.constructor.name}:pre:started`)

    if (this.partialImplementation && this.partialImplementation.onPreStart) {
      await this.partialImplementation.onPreStart()
    }

    this.eventEmitter.emit('pre:started')
  }

  public async start(): Promise<void> {
    this.logInfo(`${this.constructor.name}:started`)

    if (this.partialImplementation && this.partialImplementation.onStart) {
      await this.partialImplementation.onStart()
    }

    this.eventEmitter.emit('started')
  }

  public async postStart(): Promise<void> {
    this.logInfo(`${this.constructor.name}:post:started`)

    if (this.partialImplementation && this.partialImplementation.onPostStart) {
      await this.partialImplementation.onPostStart()
    }

    this.eventEmitter.emit('post:started')
  }

  public async preStop(): Promise<void> {
    this.logInfo(`${this.constructor.name}:pre:stopped`)

    if (this.partialImplementation && this.partialImplementation.onPreStop) {
      await this.partialImplementation.onPreStop()
    }

    this.eventEmitter.emit('pre:stopped')
  }

  public async stop(): Promise<void> {
    this.logInfo(`${this.constructor.name}:stopped`)

    if (this.partialImplementation && this.partialImplementation.onStop) {
      await this.partialImplementation.onStop()
    }

    this.eventEmitter.emit('stopped')
  }

  public async postStop(): Promise<void> {
    this.logInfo(`${this.constructor.name}:post:stopped`)

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
export class LifeCycleRunner {
  private state:
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

  constructor(private readonly lifeCyclable: ILifeCyclable) {}

  public async initialize(): Promise<void> {
    if (!this.canInitialize()) {
      throw new XyoError(`Already initialized, can not initialize again`, XyoErrors.CRITICAL)
    }

    this.state = null
    await this.lifeCyclable.preInitialize()
    this.state = 'pre:initialized'

    await this.lifeCyclable.initialize()
    this.state = 'initialized'

    await this.lifeCyclable.initialize()
    this.state = 'post:initialized'
  }

  public async start(): Promise<void> {
    if (!this.canStart()) {
      throw new XyoError(`Not yet initialized, can not start`, XyoErrors.CRITICAL)
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
      throw new XyoError(`Not yet started, can not stop`, XyoErrors.CRITICAL)
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
