import { IXyoCharacteristic } from "./xyo-characteristic"

export interface IXyoService {
  uuid: string
  name: string
  type: string
  characteristics: IXyoCharacteristic[]

  discoverCharacteristics(): Promise<IXyoCharacteristic[]>
}
