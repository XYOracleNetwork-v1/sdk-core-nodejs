
import net from 'net'
import { XyoTcpPipe } from './xyo-tcp-pipe'

export class XyoServerTcpNetwork {
  public server: net.Server
  public port: number

  constructor(port: number) {
    this.port = port
    this.server = net.createServer(this.connectionListener.bind(this))
  }

  private connectionListener (socket: net.Socket) {
    let waitSize: number
    let currentSize = 0
    let currentBuffer = Buffer.alloc(0)

    socket.on('data', (data: Buffer) => {
      currentSize += data.length
      currentBuffer = Buffer.concat([currentBuffer, data])

      if (waitSize === undefined && currentSize >= 4) {
        waitSize = currentBuffer.readUInt32BE(0)
      }

      if (currentSize >= waitSize) {
        this.onInternalPipeCreated(socket, currentBuffer.slice(4))
      }
    })
  }

  private onInternalPipeCreated (socket: net.Socket, data: Buffer) {
    const socketPipe = new XyoTcpPipe(socket, data)
  }

}
