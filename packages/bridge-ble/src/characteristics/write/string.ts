import { createWriteCharacteristic } from './create'
import { Subscribe } from '@xyo-network/utils'
import debug from 'debug'

export default class WriteStringCharacteristic extends Subscribe<string> {
  public characteristic: any
  private logger = debug('bleno:write:json')

  constructor (public name: string, public uuid: string) {
    super()
    createWriteCharacteristic(
      { name, uuid },
      value => this.handleWrite(value),
      this.logger
    )
  }

  public handleWrite = (value: string) => {
    return this.setCurrentValue(value)
  }
}
