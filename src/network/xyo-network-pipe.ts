import { XyoChoicePacket } from './xyo-choice-packet'
import { XyoAdvertisePacket } from './xyo-advertise-packet'

export interface IXyoNetworkPipe {
  getInitiationData (): XyoAdvertisePacket | undefined
  send (data: Buffer, waitForResponse: boolean): Promise<Buffer | undefined>
  close (): Promise<void>
}
