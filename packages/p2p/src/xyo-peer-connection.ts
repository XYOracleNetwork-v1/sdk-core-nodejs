import { IXyoPeer, IXyoPeerConnection, Callback } from './@types'
import { XyoPubSub } from './xyo-pub-sub'
import { encodeXyoBuffer, accumulateChunks } from './xyo-topic-buffer'
import { Socket } from 'net'
import multiaddr from 'multiaddr'

export class XyoPeerConnection implements IXyoPeerConnection {

  public publicKey = ''
  public address = ''
  public ma: IMultiaddr = multiaddr('')
  private listener: XyoPubSub = new XyoPubSub()

  constructor(private connection: Socket) {
    connection.on('error', e => this.listener.publish('error', e))
    connection.on('close', e => this.listener.publish('close', e))
    connection.on('data', accumulateChunks((d: Buffer) => this.listener.publish('message', d)))
  }

  public setMultiAddress(address: string) {
    this.ma = multiaddr(address)
    this.address = address
  }

  public setPublicKey(publicKey: string) {
    this.publicKey = publicKey
  }

  public onClose(cb: Callback) {
    return this.listener.subscribe('close', cb)
  }

  public onMessage(cb: Callback) {
    return this.listener.subscribe('message', cb)
  }

  public onError(cb: Callback) {
    return this.listener.subscribe('error', cb)
  }

  public write(msg: Buffer) {
    this.connection.write(encodeXyoBuffer(msg))
  }

  public close() {
    this.connection.destroy()
  }
}
