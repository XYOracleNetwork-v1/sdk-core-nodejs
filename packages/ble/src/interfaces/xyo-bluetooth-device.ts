import { IXyoAdvertisement } from './xyo-advertisement'
import { IXyoService } from './xyo-service'

export interface IXyoBluetoothDevice {
  lastSeen: number
  id: string
  uuid: string
  connectable: boolean
  advertisement: IXyoAdvertisement
  rssi: number
  services: IXyoService[]
  state: 'error' | 'connecting' | 'connected' | 'disconnecting' | 'disconnected'

  connect(): Promise<void>
  disconnect(): Promise<void>
  updateRssi(): Promise<number>
  discoverServicesForUuids(serviceUUIDs: string[]): Promise<IXyoService[]>
  discoverServices(): Promise<IXyoService[]>
}
