/** A function to unsubscribe from a topic */
export type unsubscribeFn = () => void

/** Any callback with an arbitrary number of args as parameters */
export type Callback = (...args: any[]) => void

export interface IXyoRepository<K, V> {
  add(id: K, item: V): Promise<void>
  remove(id: K): Promise<void>
  contains(id: K): Promise<boolean>
  find(id: K): Promise<V | undefined>
}
