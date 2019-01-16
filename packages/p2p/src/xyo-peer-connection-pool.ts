import { IXyoPeerConnectionPool, IXyoPeerConnection } from './@types'
import { XyoPubSub } from './xyo-pub-sub'

export class XyoPeerConnectionPool implements IXyoPeerConnectionPool {

  private blacklist: string[] = []
  private connectionsByPublicKey: { [publicKey: string]: IXyoPeerConnection } = {}
  private connectionsByAddress: { [publicKey: string]: IXyoPeerConnection } = {}

  public blacklistPeerConnection(addressOrPublicKey: string) {
    // Blacklisting by an address may be more effective
    this.blacklist.push(addressOrPublicKey)
  }

  public hasPeerConnectionByPublicKey(publicKey: string) {
    return !!this.connectionsByPublicKey[publicKey]
  }

  public hasPeerConnectionByAddress(address: string) {
    return !!this.connectionsByAddress[address]
  }

  public getPeerConnectionByPublicKey(publicKey: string) {
    return this.connectionsByPublicKey[publicKey]
  }

  public getPeerConnectionByAddress(address: string) {
    return this.connectionsByAddress[address]
  }

  public getPeerConnections() {
    return Object.values(this.connectionsByPublicKey)
  }

  public addPeerConnection(connection: IXyoPeerConnection) {
    if (this.isValidConnection(connection)) {
      this.connectionsByPublicKey[connection.publicKey] = connection
      this.connectionsByAddress[connection.address] = connection
    }
  }

  public removePeerConnection(connection: IXyoPeerConnection) {
    delete this.connectionsByPublicKey[connection.publicKey]
    delete this.connectionsByAddress[connection.address]
  }

  public isValidConnection(connection: IXyoPeerConnection) {
    return Boolean(
      connection &&
      connection.publicKey &&
      !this.blacklist.includes(connection.publicKey) &&
      !this.blacklist.includes(connection.address)
    )
  }
}
