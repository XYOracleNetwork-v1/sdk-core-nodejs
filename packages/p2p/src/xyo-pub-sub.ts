export type Callback = (...args: any[]) => void

export class XyoPubSub {
  private listeners: { [topic: string]: Callback[] } = {}

  public publish(topic: string, ...args: any[]) {
    if (!this.listeners[topic]) return
    this.listeners[topic].forEach(cb => cb(...args))
  }

  public subscribe(topic: string, cb: Callback): () => void {
    this.listeners[topic] = this.listeners[topic] || []
    this.listeners[topic].push(cb)

    return () => {
      this.listeners[topic] = this.listeners[topic].filter(v => v !== cb)
    }
  }
}
