import { XyoAdvertisePacket } from './xyo-advertise-packet'

abstract class XyoNetworkPipe {
  abstract getInitiationData(): XyoAdvertisePacket | undefined
  abstract send(
    data: Buffer,
    waitForResponse: boolean
  ): Promise<Buffer | undefined>
  abstract close(): Promise<void>
}

export default XyoNetworkPipe
