import { createWriteCharacteristic } from './create'
import { Subscribe } from '@xyo-network/utils'
import debug from 'debug'

export default class WriteJSONCharacteristic<T> extends Subscribe<T> {
  public characteristic: any
  private logger = debug('bleno:write:json')

  constructor (public name: string, public uuid: string) {
    super()
    this.characteristic = createWriteCharacteristic(
      { name, uuid },
      (body: string) => this.handleWrite(body),
      this.logger
    )
  }

  public handleWrite = (body: string) => {
    try {
      const json = JSON.parse(body)
      this.setCurrentValue(json)
    } catch (e) {
      this.logger(this.name, e.message)
    }
  }
}
