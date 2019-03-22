import { createReadCharacteristic } from './create'
import { Subscribe } from '@xyo-network/utils'
import debug from 'debug'

export default class ReadStringCharacteristic extends Subscribe<string> {
  public characteristic: any
  private logger = debug('bleno:read:string')

  constructor (public name: string, public uuid: string) {
    super()
    this.characteristic = createReadCharacteristic(
      { name, uuid },
      () => this.awaitCurrentValue(),
      this.logger
    )
  }
}
