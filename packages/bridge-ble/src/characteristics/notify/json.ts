import { createNotifyCharacteristic } from './create'
import { Subscribe } from '@xyo-network/utils'
import debug from 'debug'

export default class ReadStringCharacteristic<T> extends Subscribe<T> {
  public characteristic: any
  private logger = debug('bleno:notify:json')

  constructor (public name: string, public uuid: string) {
    super()
    this.characteristic = createNotifyCharacteristic(
      { name, uuid },
      (fn) => {
        const timer = setTimeout(() => fn(JSON.stringify(this.getCurrentValue())), 1000)
        const unsub = this.subscribe(data => fn(JSON.stringify(data)))
        return () => {
          clearTimeout(timer)
          unsub()
        }
      },
      this.logger
    )
  }
}
