import { IXyoMetaList } from '@xyo-network/meta-list'
import { XyoPair } from '..'

/** A function to unsubscribe from a topic */
export type unsubscribeFn = () => void

/** Any callback with an arbitrary number of args as parameters */
export type Callback = (...args: any[]) => void

export interface IRepoItem<V, M> {
  data: V,
  meta: M
}

export interface IXyoRepository<K, V, M> {
  add(id: K, item: V, meta?: M): Promise<void>
  remove(id: K): Promise<void>
  contains(id: K): Promise<boolean>
  find(id: K): Promise<IRepoItem<V, M> | undefined>
  list(limit: number, cursor: string | undefined): Promise<IXyoMetaList<IRepoItem<V, M>>>
}

export type pureFn<V> = () => V
export type asyncPureFn<V> = () => Promise<V>

export type providerFn<V> = () => Promise<V>
export type parameterizedProviderFn<C, V> = (context: C) => Promise<V>
export type factoryFn<V> = () => V
export type parameterizedFactoryFn<C, V> = (context: C) => V

export interface IProvider<V> {
  get(): Promise<V>
}
export interface IParameterizedProvider<C, V> {
  get(context: C): Promise<V>
  add(v: V, keep?: boolean): Promise<C>
}
export interface IFactory<V> {
  get(): V
}

export interface IParameterizedFactory<C, V> {
  get(context: C): V
}

export interface IInitializable {
  initialize(): Promise<void>
}

export interface IRunnable extends IInitializable {
  start(): Promise<void>
  stop(): Promise<void>
}

export interface ILifeCycleEvent {
  onPreInitialize(): Promise<void>
  onInitialize(): Promise<void>
  onPostInitialize(): Promise<void>

  onPreStart(): Promise<void>
  onStart(): Promise<void>
  onPostStart(): Promise<void>

  onPreStop(): Promise<void>
  onStop(): Promise<void>
  onPostStop(): Promise<void>
}

export interface ILifeCyclable extends IRunnable {
  preInitialize(): Promise<void>
  initialize(): Promise<void>
  postInitialize(): Promise<void>

  preStart(): Promise<void>
  postStart(): Promise<void>

  preStop(): Promise<void>
  postStop(): Promise<void>

  on(event: string | symbol, listener: (...args: any[]) => void): this
  once(event: string | symbol, listener: (...args: any[]) => void): this
  off(event: string | symbol, listener: (...args: any[]) => void): this
  removeAllListeners(event?: string | symbol): this
}

export type depScope = 'transient' | 'singleton'

export interface IXyoProviderContainer {
  hasDependency(dep: string): boolean
  get<T>(dep: string): Promise<T>
  register<T, C>(dep: string, provider: IXyoProvider<T, C>, scope: depScope): void
}

export interface IXyoProvider<T, C> {
  get(container: IXyoProviderContainer, providerConfig: C): Promise<T>
  postInit?(instance: T, container: IXyoProviderContainer, providerConfig: C): Promise<void>
}
