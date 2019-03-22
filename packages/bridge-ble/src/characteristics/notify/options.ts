import { Characteristic, Descriptor } from 'bleno'
import { IBLECharacteristic } from '../../@types'

export const createNotifyOptions = (
  { uuid, name }: IBLECharacteristic
) => {
  return {
    uuid,
    properties: ['notify'],
    value: null
  }
}
