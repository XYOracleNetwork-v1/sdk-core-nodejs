import { Characteristic } from 'bleno'
import { createReadOptions } from './options'
import { IBLECharacteristic } from '../../@types'
import debug from 'debug'

export const createReadCharacteristic = (
  { uuid, name }: IBLECharacteristic,
  getCurrentValue: () => Promise<string | null>,
  logger = debug('bleno:read')
) => {
  const characteristic = new Characteristic(
    createReadOptions({ uuid, name }, async (offset: any, callback: any) => {
      try {
        logger(name, offset)
        const result = await getCurrentValue()
        const str = typeof result === 'string' ? result : ''
        const buffer = Buffer.from(str)
        if (offset > buffer.length) {
          logger(name, 'invalid offset')
          callback(characteristic.RESULT_INVALID_OFFSET, null)
        } else {
          logger(name, result, offset)
          callback(characteristic.RESULT_SUCCESS, buffer.slice(offset))
        }
      } catch (err) {
        logger(name, err)
        callback(characteristic.RESULT_UNLIKELY_ERROR)
      }
    }) as any
  ) as any
  return characteristic
}
