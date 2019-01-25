import { IXyoP2PService, IXyoPeer, IXyoPeerTransport, unsubscribeFn, IXyoPeerConnection, IXyoPeerDiscoveryService, Callback } from "./@types"
import { XyoPubSub } from './xyo-pub-sub'
import { XyoPeerTransport } from './xyo-peer-transport'
import { encodeXyoTopicBuffer, decodeXyoTopicBuffer } from "./xyo-topic-buffer"
import { XyoPeerConnectionPool } from "./xyo-peer-connection-pool"
import { Server } from 'net'

enum Attrs {
  address = 'address',
  publicKey = 'publicKey'
}

export class XyoPeerDiscoveryService implements IXyoPeerDiscoveryService {
  private running = false
  private bootstrapAddresses: string[] = []
  private listener: XyoPubSub = new XyoPubSub()
  private pool: XyoPeerConnectionPool = new XyoPeerConnectionPool()
  private starting: Promise<undefined> = Promise.resolve(undefined)

  constructor(
    private publicKey: string,
    private address: string,
    private transport: IXyoPeerTransport,
  ) {
    this.onDiscovery(connection => this.pool.addPeerConnection(connection))
    this.onDisconnected(connection => this.pool.removePeerConnection(connection))
    this.transport.onConnection((connection) => {
      this.handleBootstrap(connection)
      this.handleClose(connection)
    })
  }

  public getListOfPeersAttributes = (attr: Attrs) => {
    return this.pool.getPeerConnections()
    .map(conn => conn[attr])
    .filter(value => !!value)
  }

  public getListOfKnownAddresses () {
    return this.getListOfPeersAttributes(Attrs.address)
  }

  public getListOfKnownPublicKeys() {
    return this.getListOfPeersAttributes(Attrs.publicKey)
  }

  public getListOfKnownPeers () {
    return this.pool.getPeerConnections()
  }

  public getPeerConnection (publicKey: string) {
    return this.pool.getPeerConnectionByPublicKey(publicKey)
  }

  public addBootstrapNodes(addresses: string[]) {
    this.bootstrapAddresses.push(...addresses.filter(this.isValidBootstrapAddress))
    if (this.running) this.dialBootstrapNodes()
  }

  public async start() {
    if (this.running) return this.starting

    this.starting = this.transport.start().then(() => undefined)
    this.running = true

    await this.starting
    this.dialBootstrapNodes()
    return undefined
  }

  public stop() {
    this.running = false
    this.transport.stop()
  }

  public onDiscovery(cb: Callback) {
    return this.listener.subscribe('discovery', cb)
  }

  public onHeartbeat(cb: Callback) {
    return this.listener.subscribe('heartbeat', cb)
  }

  public onDisconnected(cb: Callback) {
    return this.listener.subscribe('disconnected', cb)
  }

  private encodeKeyExchange(): Buffer {
    return encodeXyoTopicBuffer(
      'discovery',
      Buffer.from(JSON.stringify({
        address: this.address,
        publicKey: this.publicKey,
        peers: this.getListOfKnownAddresses()
      }))
    )
  }

  private dialBootstrapNodes () {
    this.bootstrapAddresses.forEach((address) => {
      this.transport.dial(address).then((connection) => {
        connection.write(this.encodeKeyExchange())
        this.handleHandshake(connection)
        this.handleClose(connection)
      })
    })
    this.bootstrapAddresses = []
  }

  private handleBootstrap(connection: IXyoPeerConnection) {
    connection.onMessage((msg) => {
      const { topic, message } = decodeXyoTopicBuffer(msg)
      if (topic === 'discovery') {
        const { publicKey, address, peers } = JSON.parse(message) // TODO sanitize / validate input
        connection.setPublicKey(publicKey)
        connection.setMultiAddress(address)
        connection.write(this.encodeKeyExchange())
        this.listener.publish('discovery', connection)
        this.addBootstrapNodes(peers)
      }
    })
  }

  private handleHandshake(connection: IXyoPeerConnection) {
    connection.onMessage((msg) => {
      const { topic, message } = decodeXyoTopicBuffer(msg)
      if (topic === 'discovery') {
        const { publicKey, address, peers } = JSON.parse(message)
        connection.setPublicKey(publicKey)
        connection.setMultiAddress(address)
        this.listener.publish('discovery', connection)
        this.addBootstrapNodes(peers)
      }
    })
  }

  private handleClose(connection: IXyoPeerConnection) {
    connection.onClose(() => {
      if (connection.publicKey) {
        this.listener.publish('disconnected', connection)
      }
    })
  }

  private isValidBootstrapAddress = (address: string) => {
    if (this.address === address) return false
    // TODO: Do not connect to peers that are in progress
    return !this.pool.getPeerConnectionByAddress(address)
  }
}
