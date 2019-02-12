/** A function to unsubscribe from a topic */
export type unsubscribeFn = () => void

/** Any callback with an arbitrary number of args as parameters */
export type Callback = (...args: any[]) => void
