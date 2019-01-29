import { IXyoP2PService, unsubscribeFn, IXyoPeerDiscoveryService } from './@types'
import { XyoBase } from '@xyo-network/base'
import { XyoPubSub } from './xyo-pub-sub'
import { decodeXyoTopicBuffer, encodeXyoTopicBuffer } from './xyo-topic-buffer'

type Callback = (senderPublicKey: string, message: Buffer) => void

export class XyoP2PService extends XyoBase implements IXyoP2PService {

  private listener: XyoPubSub = new XyoPubSub()

  constructor(
    private discoveryService: IXyoPeerDiscoveryService,
  ) {
    super()
    this.discoveryService.onDiscovery((connection) => {
      connection.onMessage((msg) => {
        const { topic, message } = decodeXyoTopicBuffer(msg)
        this.listener.publish(topic, connection.publicKey, message)
      })
    })
  }

  public getPeers() {
    return this.discoveryService.getListOfKnownPeers()
  }

  public publishMessageToPeer(topic: string, message: Buffer, publicKey: string) {
    const connection = this.discoveryService.getPeerConnection(publicKey)
    if (connection) {
      connection.write(encodeXyoTopicBuffer(topic, message))
    }
    return Promise.resolve()
  }

  public publish(topic: string, message: Buffer) {
    this.discoveryService.getListOfKnownPublicKeys().forEach(publicKey =>
      this.publishMessageToPeer(topic, message, publicKey))

    return Promise.resolve()
  }

  public subscribe(topic: string, cb: Callback): unsubscribeFn {
    return this.listener.subscribe(topic, cb)
  }

  public startDiscovering() {
    return this.discoveryService.start()
  }
}
