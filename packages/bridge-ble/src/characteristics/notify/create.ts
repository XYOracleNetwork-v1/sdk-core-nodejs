import { Characteristic } from 'bleno'
import { createNotifyOptions } from './options'
import { IBLECharacteristic } from '../../@types'
import debug from 'debug'

export const createNotifyCharacteristic = (
  { uuid, name }: IBLECharacteristic,
  subscribe: (fn: (result: string) => void) => () => any,
  logger = debug('bleno:notify')
) => {
  let unsubscribe = () => null
  const options = createNotifyOptions({ uuid, name }) as any
  options.onSubscribe = (maxValueSize: any, fn: any) => {
    logger(`Subscribed ${name}`, `maxValueSize=${maxValueSize}`)
    unsubscribe = subscribe((result) => {
      try {
        const str = typeof result === 'string' ? result : ''
        logger(`Notify ${name}`, `result=${str}`, Buffer.from(str).length, Buffer.from(str).byteLength)
        fn(Buffer.from(str))
      } catch (e) {
        console.log(e)
      }
    })
  }
  options.onUnsubscribe = () => {
    logger(`Unsubscribed ${name}`)
    unsubscribe()
  }
  const characteristic = new Characteristic(options) as any
  return characteristic
}
