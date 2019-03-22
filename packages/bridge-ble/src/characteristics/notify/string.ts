import { createNotifyCharacteristic } from './create'
import { Subscribe } from '@xyo-network/utils'
import debug from 'debug'

export default class NotifyStringCharacteristic extends Subscribe<string> {
  public characteristic: any
  private logger = debug('bleno:notify:string')

  constructor (public name: string, public uuid: string) {
    super()
    this.characteristic = createNotifyCharacteristic(
      { name, uuid },
      (fn) => {
        const timer = setTimeout(() => fn(this.getCurrentValue() || ''), 1000)
        const unsub = this.subscribe(data => fn(data))
        return () => {
          clearTimeout(timer)
          unsub()
        }
      },
      this.logger
    )
  }
}
