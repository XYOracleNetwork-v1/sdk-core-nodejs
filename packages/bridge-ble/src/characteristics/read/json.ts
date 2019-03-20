import { createReadCharacteristic } from './create'
import { Subscribe } from '@xyo-network/utils'
import debug from 'debug'

export default class ReadJSONCharacteristic<T> extends Subscribe<T> {
  public characteristic: any
  private logger = debug('bleno:read:json')

  constructor (public name: string, public uuid: string) {
    super()
    this.characteristic = createReadCharacteristic({ name, uuid }, async () => {
      const value = await this.awaitCurrentValue()
      return JSON.stringify(value)
    }, this.logger)
  }
}
