import { IXyoBluetoothDevice } from './xyo-bluetooth-device'

export interface IXyoScann {
  startScan (): Promise<void>
  stopScan (): Promise<void>
  getDevices (): IXyoBluetoothDevice[]
}
