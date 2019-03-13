import { IXyoDescriptor } from './xyo-descriptor'

export interface IXyoCharacteristic {
  uuid: string
  name: string
  type: string
  properties: string[]
  descriptors: IXyoDescriptor[]

  read(): Promise<Buffer>
  write(value: Buffer): Promise<void>
  discoverDescriptors(): Promise<IXyoDescriptor[]>
  subscribe(): Promise<void>
  unsubscribe(): Promise<void>

  on(event: "notification", listener: (data: Buffer, isNotification: boolean) => void): this
}
