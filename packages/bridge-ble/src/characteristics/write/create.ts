import { Characteristic } from 'bleno'
import { createWriteOptions } from './options'
import { IBLECharacteristic } from '../../@types'
import debug from 'debug'

type ICallback = (data: string) => void

export const createWriteCharacteristic = (
  { uuid, name }: IBLECharacteristic,
  updateCurrentValue: ICallback,
  logger = debug('bleno:write')
) => {
  const characteristic = new Characteristic(
    createWriteOptions({ uuid, name }, (data: Buffer, offset: any, withoutResponse: any, callback: any) => {
      try {
        logger(name)
        const body = data.toString('utf-8')
        logger(name, body)
        callback(characteristic.RESULT_SUCCESS)
        updateCurrentValue(body)
      } catch (err) {
        logger(name, err.message)
        callback(characteristic.RESULT_UNLIKELY_ERROR)
      }
    }) as any
  ) as any
  return characteristic
}
