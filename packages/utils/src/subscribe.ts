import { EventEmitter } from 'events'
import { CurrentValue } from './value'

export class Subscribe<T> extends CurrentValue<T> {
  private eventName = 'updated'
  private event = new EventEmitter()

  public listenerCount (): number {
    return this.event.listenerCount(this.eventName)
  }

  public hasSubscribers (): boolean {
    return !!this.listenerCount()
  }

  public setCurrentValue (value: T) {
    if (value !== this.getCurrentValue()) this.emit(value)
    super.setCurrentValue(value)
  }

  public subscribe (fn: (d: T) => void) {
    this.event.addListener(this.eventName, (d: T) => fn(d))
    return () => {
      this.event.removeListener(this.eventName, fn)
    }
  }

  private emit (data: T) {
    this.event.emit(this.eventName, data)
  }
}
