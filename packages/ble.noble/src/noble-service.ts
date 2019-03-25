// import noble from '@s524797336/noble-mac'
import noble from 'noble'
import { IXyoService, IXyoCharacteristic } from '@xyo-network/ble'
import { NobleCharacteristic } from './noble-characteristic'
import { XyoLogger } from '@xyo-network/logger'

export class NobleService implements IXyoService {
  public logger: XyoLogger = new XyoLogger(false, false)
  public service: noble.Service

  get uuid (): string {
    return this.service.uuid
  }

  get name (): string  {
    return this.service.name
  }

  get type (): string {
    return this.service.type
  }

  get characteristics (): IXyoCharacteristic[] {
    const returnArray: IXyoCharacteristic[] = []

    this.service.characteristics.forEach((characteristic) => {
      returnArray.push(new NobleCharacteristic(characteristic))
    })

    return returnArray
  }

  constructor(service: noble.Service) {
    this.service = service
  }

  public discoverCharacteristics(): Promise<IXyoCharacteristic[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(`Trying to discover characteristics for service with uuid: ${this.service.uuid}`)

      this.service.discoverCharacteristics([], (error, characteristics) => {
        if (error == null) {
          this.logger.info(`Successfully discovered characteristics for service with uuid: ${this.service.uuid}`)

          const returnArray: IXyoCharacteristic[] = []

          characteristics.forEach((characteristic) => {
            returnArray.push(new NobleCharacteristic(characteristic))
          })

          resolve(returnArray)
        } else {
          this.logger.error(`Error discovering characteristics for service with uuid: ${this.service.uuid}`)

          reject(error)
        }
      })
    })
  }
}
