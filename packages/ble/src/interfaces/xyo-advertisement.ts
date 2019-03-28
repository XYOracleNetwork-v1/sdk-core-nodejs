export interface IXyoAdvertisement {
  localName: string
  txPowerLevel: number
  manufacturerData: Buffer
  serviceUuids: string[]
  // tslint:disable-next-line:prefer-array-literal
  serviceData: Array<{uuid: string, data: Buffer}>
}
