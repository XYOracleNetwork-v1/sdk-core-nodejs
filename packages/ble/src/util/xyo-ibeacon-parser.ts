import { IXyoAdvertisement } from '../interfaces/xyo-advertisement'
import { IXyoIBeacon } from '../interfaces/xyo-ibeacon'

// 4c 00 02 15
// d6 84 35 2e df 36 48 4e bc 98 2d 53 98 c5 59 3e
// 83 22
// 97 38
// c5
export function getIBeacon(ad: IXyoAdvertisement): IXyoIBeacon | null {
  const manufactureData = ad.manufacturerData

  if (manufactureData == null) {
    return null
  }

  if (manufactureData[0] === 0x4c &&
        manufactureData[1] === 0x00 &&
        manufactureData[2] === 0x02 &&
        manufactureData[3] === 0x15 &&
        manufactureData.length === 25) {
    const uuid = manufactureData.slice(4, 20).toString('hex')
    const major = manufactureData.readUInt16BE(20)
    const minor = manufactureData.readUInt16BE(22)
    const powerLevel = manufactureData.readInt8(24)

    const iBeacon: IXyoIBeacon = {
      uuid,
      major,
      minor,
      powerLevel
    }

    return iBeacon
  }

  return null
}
