import { Characteristic, Descriptor } from 'bleno'
import { IBLECharacteristic } from '../../@types'

export const createReadOptions = (
  { uuid, name }: IBLECharacteristic,
  onReadRequest: (offset: any, callback: any
) => void) => {
  return {
    uuid,
    onReadRequest,
    properties: ['read'],
    value: null,
    descriptors: [
      new Descriptor({
        uuid: '2901',
        value: name
      }) as any
    ]
  }
}
