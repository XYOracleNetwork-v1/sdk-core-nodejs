/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { XyoChoicePacket } from './xyo-choice-packet'
import { XyoAdvertisePacket } from './xyo-advertise-packet'

export interface IXyoNetworkPipe {
  getInitiationData(): XyoAdvertisePacket | undefined
  send(data: Buffer, waitForResponse: boolean): Promise<Buffer | undefined>
  close(): Promise<void>
}
