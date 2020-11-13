import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import net from 'net'

import { XyoAdvertisePacket } from '../xyo-advertise-packet'
import XyoNetworkPipe from '../xyo-network-pipe'

export class XyoTcpPipe extends XyoBase implements XyoNetworkPipe {
  private socket: net.Socket
  private initData: XyoAdvertisePacket | undefined

  constructor(socket: net.Socket, initData: XyoAdvertisePacket | undefined) {
    super()
    this.socket = socket
    this.initData = initData
  }

  public getInitiationData(): XyoAdvertisePacket | undefined {
    return this.initData
  }

  public async send(
    data: Buffer,
    waitForResponse: boolean
  ): Promise<Buffer | undefined> {
    this.logVerbose(`Sending data through socket: ${data.toString('hex')}`)
    await this.sendData(data)

    if (waitForResponse) {
      const response = await this.waitForMessage()
      this.logVerbose(`Got data through socket: ${response.toString('hex')}`)
      return response
    }

    return undefined
  }

  // eslint-disable-next-line require-await
  public async close() {
    this.logInfo(
      `Closing connection with ${this.socket.remoteAddress}:${this.socket.remotePort}`
    )
    this.socket.end()

    setTimeout(() => {
      if (!this.socket.destroyed) {
        this.socket.destroy()
      }
    }, 2_000)
  }

  private waitForMessage(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let hasResumed = false
      let waitSize: number
      let currentSize = 0
      let currentBuffer = Buffer.alloc(0)

      const cleanup = () => {
        this.socket.removeAllListeners('data')
        this.socket.removeAllListeners('close')
        this.socket.removeAllListeners('end')
      }

      const onTimeout = () => {
        if (!hasResumed) {
          hasResumed = true
          this.socket.destroy()
          cleanup()
          reject(new Error('timeout'))
        }
      }

      const onClose = () => {
        if (!hasResumed) {
          hasResumed = true
          cleanup()
          reject(new Error('Socket closed while waiting for write'))
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
          cleanup()
          resolve(currentBuffer.slice(4))
        }
      })

      this.socket.on('close', onClose)
      this.socket.on('error', onClose)

      setTimeout(onTimeout, 7_500)
    })
  }

  private sendData(data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const sizeBuffer = Buffer.alloc(4)
      sizeBuffer.writeUInt32BE(data.length + 4, 0)
      const dataWithSize = Buffer.concat([sizeBuffer, data])

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
