import net from 'net'
import { IXyoNetworkPipe } from '../xyo-network-pipe'
import { XyoAdvertisePacket } from '../xyo-advertise-packet'

export class XyoTcpPipe implements IXyoNetworkPipe {
  private socket: net.Socket
  private initData: XyoAdvertisePacket | undefined

  constructor (socket: net.Socket, initData: XyoAdvertisePacket | undefined) {
    this.socket = socket
    this.initData = initData
  }

  public getInitiationData (): XyoAdvertisePacket | undefined {
    return this.initData
  }

  public async send (data: Buffer, waitForResponse: boolean): Promise<Buffer | undefined> {
    await this.sendData(data)

    if (waitForResponse) {
      return this.waitForMessage()
    }

    return undefined
  }

  public async close() {
    this.socket.end()
  }

  private waitForMessage (): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let hasResumed = false
      let waitSize: number
      let currentSize = 0
      let currentBuffer = Buffer.alloc(0)

      const onTimeout = () => {
        if (!hasResumed) {
          hasResumed = true
          this.socket.end()
          this.socket.removeAllListeners()
          reject('timeout')
        }
      }

      this.socket.on('data', (data: Buffer) => {
        currentSize += data.length
        currentBuffer = Buffer.concat([currentBuffer, data])

        if (waitSize === undefined && currentSize >= 4) {
          waitSize = currentBuffer.readUInt32BE(0)
        }

        if (currentSize >= waitSize && !hasResumed) {
          hasResumed = true
          this.socket.removeAllListeners()
          resolve(currentBuffer.slice(4))
        }
      })

      this.socket.on('close', () => {
        if (!hasResumed) {
          hasResumed = true
          this.socket.removeAllListeners()
          reject('Socket closed while waiting for write')
        }
      })

      setTimeout(onTimeout, 7_500)
    })
  }

  private sendData (data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const sizeBuffer = Buffer.alloc(4)
      sizeBuffer.writeUInt32BE(data.length + 4, 0)
      const dataWithSize = Buffer.concat([
        sizeBuffer,
        data
      ])

      this.socket.write(dataWithSize, (error) => {
        if (error === undefined) {
          resolve()
        } else {
          reject(error)
        }
      })
    })
  }
}
