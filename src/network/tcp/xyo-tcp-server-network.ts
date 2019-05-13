
import net from 'net'
import { XyoTcpPipe } from './xyo-tcp-pipe'
import { XyoAdvertisePacket } from '../xyo-advertise-packet'
import { XyoBase } from '@xyo-network/sdk-base-nodejs'

export class XyoServerTcpNetwork extends XyoBase {
  public onPipeCreated: ((pipe: XyoTcpPipe) => void) | undefined
  public server: net.Server
  public port: number

  constructor(port: number) {
    super()
    this.port = port
    this.server = net.createServer(this.connectionListener.bind(this))

    this.server.on('error', (e) => {
      this.logWarning(`Unknown server socket error: ${e}`)

      if (!this.server.listening) {
        this.logInfo(`Starting listing again on port ${this.port}`)
        this.server.listen(this.port)
      }
    })
  }

  public startListening() {
    this.server.listen(this.port)
  }

  public stopListening() {
    this.server.close()
  }

  private connectionListener(socket: net.Socket) {
    this.logInfo(`New connection made with ${socket.remoteAddress}:${socket.remotePort}`)

    socket.on('error', (e) => {
      this.logWarning(`Unknown socket error: ${e}`)
      socket.destroy()
    })

    let waitSize: number
    let currentSize = 0
    let currentBuffer = Buffer.alloc(0)

    const cleanup = () => {
      socket.removeAllListeners('data')
      socket.removeAllListeners('close')
      socket.removeAllListeners('end')
      socket.destroy()
    }

    socket.on('data', (data: Buffer) => {
      currentSize += data.length
      currentBuffer = Buffer.concat([currentBuffer, data])

      if (waitSize === undefined && currentSize >= 4) {
        waitSize = currentBuffer.readUInt32BE(0)
      }

      if (currentSize >= waitSize) {
        this.onInternalPipeCreated(socket, currentBuffer.slice(4))

        socket.removeAllListeners('data')
        socket.removeAllListeners('close')
        socket.removeAllListeners('end')
      }
    })

    socket.on('close', cleanup)
    socket.on('end', cleanup)
  }

  private onInternalPipeCreated(socket: net.Socket, data: Buffer) {
    const socketPipe = new XyoTcpPipe(socket, new XyoAdvertisePacket(data))
    const callback = this.onPipeCreated

    if (callback) {
      callback(socketPipe)
    }
  }
}
