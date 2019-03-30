// tslint:disable-next-line:no-reference
/// <reference path="./@types/multiaddr.d.ts" />
import multiaddr from 'multiaddr'
import {  IXyoPeerTransport, IXyoPeerConnection } from './@types'
import { XyoPubSub } from './xyo-pub-sub'
import { XyoPeerConnection } from './xyo-peer-connection'
import net, { Server } from 'net'

export class XyoPeerTransport implements IXyoPeerTransport {
  public address!: string
  private listener: XyoPubSub = new XyoPubSub()
  private server: undefined | Server
  private port: undefined | number
  private host!: string

  public initialize(address: string) {
    this.address = address
    const { port, address: host } = multiaddr(this.address).nodeAddress()
    this.port = port as number
    this.host = host as string
  }

  public start() {
    return new Promise<Server>((resolve) => {
      this.server = net.createServer((socket) => {
        const connection = new XyoPeerConnection(socket)
        connection.setMultiAddress(`/ip4/${socket.remoteAddress}/tcp/${socket.remotePort}`)
        this.listener.publish('connected', connection)
      })

      this.server.listen(this.port, '0.0.0.0', () => {
        resolve(this.server)
      })
    })
  }

  public stop() {
    if (this.server) {
      this.server.close()
    }
  }

  public onConnection(cb: (connection: IXyoPeerConnection) => void) {
    return this.listener.subscribe('connected', cb)
  }

  public dial(address: string) {
    return new Promise<IXyoPeerConnection>((resolve) => {
      const ma = multiaddr(address)
      const addr = ma.nodeAddress()
      const client = new net.Socket()
      const connection = new XyoPeerConnection(client)
      connection.setMultiAddress(address)
      client.connect(addr.port, addr.address, () => {
        resolve(connection)
      })
    })
  }
}
