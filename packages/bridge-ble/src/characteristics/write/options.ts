import { Characteristic, Descriptor } from 'bleno'
import { IBLECharacteristic } from '../../@types'

export const createWriteOptions = (
  { uuid, name }: IBLECharacteristic,
  onWriteRequest: (data: Buffer, offset: any, withoutResponse: any, callback: any) => void
) => {
  return {
    uuid,
    onWriteRequest,
    properties: ['write'],
    value: null,
    descriptors: [
      new Descriptor({
        uuid: '2901',
        value: name
      }) as any
    ]
  }
}
