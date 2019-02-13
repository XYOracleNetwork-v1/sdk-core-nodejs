import { IXyoPeerTransport, IXyoPeerConnection, IXyoPeerDiscoveryService, IXyoPeerDiscoveryConfig } from "./@types"
import { XyoPubSub } from './xyo-pub-sub'
import { encodeXyoTopicBuffer, decodeXyoTopicBuffer } from "./xyo-topic-buffer"
import { XyoPeerConnectionPool } from "./xyo-peer-connection-pool"
import { XyoBase } from "@xyo-network/base"
import { Callback } from "@xyo-network/utils"

enum Attrs {
  address = 'address',
  publicKey = 'publicKey'
}

export class XyoPeerDiscoveryService extends XyoBase implements IXyoPeerDiscoveryService {
  private running = false
  private bootstrapAddresses: string[] = []
  private listener: XyoPubSub = new XyoPubSub()
  private pool: XyoPeerConnectionPool = new XyoPeerConnectionPool()
  private starting: Promise<undefined> = Promise.resolve(undefined)
  private publicKey!: string
  private address!: string

  constructor(private transport: IXyoPeerTransport) {
    super()
  }

  public initialize(config: IXyoPeerDiscoveryConfig) {
    this.publicKey = config.publicKey
    this.address = config.address

    this.onDiscovery((connection) => {
      this.logInfo(`Discovered Peer`)
      this.pool.addPeerConnection(connection)
    })
    this.onDisconnected((connection) => {
      this.logInfo('Disconnected from Peer')
      this.pool.removePeerConnection(connection)
    })
    this.transport.onConnection((connection) => {
      this.logInfo(`Connected to Peer ${connection.publicKey}`)
      this.handleBootstrap(connection)
      this.handleClose(connection)
    })

    return
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
    this.logInfo(`Adding bootstrap nodes ${addresses.map(a => `\n${a}`)}`)
    this.bootstrapAddresses.push(...addresses.filter(this.isValidBootstrapAddress))
    if (this.running) this.dialBootstrapNodes()
  }

  public async start() {
    this.logInfo(`Starting discovery`)
    if (this.running) return this.starting

    this.starting = this.transport.start().then(() => undefined)
    this.running = true

    await this.starting
    this.dialBootstrapNodes()
    return undefined
  }

  public stop() {
    this.logInfo(`Stopping discovery`)
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
    this.logInfo(`Dialing bootstrap nodes`)
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
        const { publicKey, address, peers } = JSON.parse(message.toString()) // TODO sanitize / validate input
        this.logInfo(`Discovery topic received for publicKey ${publicKey}`)
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
        const { publicKey, address, peers } = JSON.parse(message.toString())
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
