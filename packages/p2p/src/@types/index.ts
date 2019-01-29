import { Server } from "net"

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 16th January 2019 9:50:43 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 29th January 2019 11:09:37 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IXyoP2PService {

  /**
   * Returns a list of peers that the p2p service knows about
   *
   * @returns {Promise<IXyoPeer][]>}
   * @memberof IXyoP2PService
   */
  getPeers(): IXyoPeer[]

  /**
   * Publishes a message for a topic to the network of peers
   *
   * @param {string} topic
   * @param {Buffer} message
   * @returns {Promise<void>}
   * @memberof IXyoP2PService
   */
  publish(topic: string, message: Buffer): Promise<void>

  /**
   * Publishes a message for a topic to a particular peer
   *
   * @param {string} topic
   * @param {Buffer} message
   * @param {string} publicKey
   *
   * @returns {Promise<void>}
   * @memberof IXyoP2PService
   */
  publishMessageToPeer(topic: string, message: Buffer, publicKey: string): Promise<void>

  /**
   * Subscribe to a particular topic and call a callback when it happens
   *
   * @param {string} topic
   * @param {(senderPublicKey: string, message: Buffer) => void} cb
   * @returns {unsubscribeFn}
   * @memberof IXyoP2PService
   */
  subscribe(topic: string, cb: (senderPublicKey: string, message: Buffer) => void): unsubscribeFn

  startDiscovering(): Promise<undefined>
}

export interface IXyoPeer {

  /**
   * Hex representation of the public key
   *
   * @type {string}
   * @memberof IXyoPeer
   */
  publicKey: string

  /**
   * The address for where to reach the peer
   *
   * @type {string}
   * @memberof IXyoPeer
   */
  address: string
}

export interface IXyoPeerTransport {
  /**
   * Listen for connections on supplied address
   * @memberof IXyoPeerReceiver
   */
  start(): Promise<Server>

  /**
   * Stop listening for connections
   *
   * @memberof IXyoPeerReceiver
   */

  stop(): void

  /**
   *
   * @param {(connection: IXyoPeerConnection) => void} cb Callback function called with new peer connection
   * @returns {unsubscribeFn}
   * @memberof IXyoPeerReceiver
   */

  onConnection(cb: (connection: IXyoPeerConnection) => void): unsubscribeFn

  /**
   *
   * Dial to a receiver and resolve the peer connection
   *
   * @param {string} address
   * @returns {Promise<IXyoPeerConnection>}
   * @memberof IXyoPeerDialer
   */

  dial (address: string): Promise<IXyoPeerConnection>
}

export interface IXyoPeerConnection {
  publicKey: string
  address: string

  setMultiAddress: (address: string) => void

  setPublicKey: (publicKey: string) => void

  write: (msg: Buffer) => void

  onMessage: (cb: (msg: Buffer) => void) => unsubscribeFn

  onClose: (cb: () => void) => unsubscribeFn

  close: () => void
}

export interface IXyoPeerDiscoveryService {
  start(): Promise<undefined>

  stop(): void

  getListOfKnownPeers(): IXyoPeer[]

  getListOfKnownAddresses(): string[]

  getListOfKnownPublicKeys(): string[]

  getPeerConnection(publicKey: string): IXyoPeerConnection

  addBootstrapNodes(addresses: string[]): void

  onDiscovery(cb: (connection: IXyoPeerConnection) => void): unsubscribeFn

  onHeartbeat(cb: (publicKey: string) => void): unsubscribeFn

  onDisconnected(cb: (publicKey: string) => void): unsubscribeFn
}

export interface IXyoPeerConnectionPool {
  hasPeerConnectionByPublicKey(publicKey: string): boolean

  hasPeerConnectionByAddress(address: string): boolean

  getPeerConnectionByPublicKey(publicKey: string): IXyoPeerConnection

  getPeerConnectionByAddress(address: string): IXyoPeerConnection

  getPeerConnections(): IXyoPeerConnection[]

  addPeerConnection(connection: IXyoPeerConnection): void

  removePeerConnection(connection: IXyoPeerConnection): void

  isValidConnection(connection: IXyoPeerConnection): boolean
}

/** A function to unsubscribe from a topic */
export type unsubscribeFn = () => void

export type Callback = (...args: any[]) => void
