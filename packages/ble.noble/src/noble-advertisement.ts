import { IXyoAdvertisement, IXyoService } from '@xyo-network/ble'
import { XyoLogger } from '@xyo-network/logger'
// import noble from '@s524797336/noble-mac'
import noble from 'noble'

export class NobleAdvertisement implements IXyoAdvertisement {
  public advertisement: noble.Advertisement

  get localName (): string {
    return this.advertisement.localName
  }

  get txPowerLevel (): number {
    return this.advertisement.txPowerLevel
  }

  get manufacturerData (): Buffer {
    return this.advertisement.manufacturerData
  }

  get serviceUuids (): string[] {
    return this.advertisement.serviceUuids
  }

  // tslint:disable-next-line:prefer-array-literal
  get serviceData (): Array<{uuid: string, data: Buffer}> {
    return this.advertisement.serviceData
  }

  constructor (advertisement: noble.Advertisement) {
    this.advertisement = advertisement
  }
}
