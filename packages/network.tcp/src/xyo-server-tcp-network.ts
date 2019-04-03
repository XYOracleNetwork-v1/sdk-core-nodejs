/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 6th September 2018 12:49:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-tcp-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 3:02:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  IXyoNetworkProvider,
  IXyoNetworkProcedureCatalogue,
  IXyoNetworkPipe
} from '@xyo-network/network'

import { XyoTcpConnectionResult } from './xyo-tcp-connection-result'
import { XyoTcpNetworkPipe } from './xyo-tcp-network-pipe'

import net from 'net'
import { XyoBase } from '@xyo-network/base'
import { readIntegerFromBuffer } from '@xyo-network/buffer-utils'

/**
 * A network provider build on top of the TCP/IP stack.
 * This implementation may seem peculiar because there is a
 * great deal of effort to ensure that there is never more than
 * one `meaningful` connection made to a peer.
 */

export class XyoServerTcpNetwork extends XyoBase implements IXyoNetworkProvider {

  /**
   * An ephemeral short lived server for making connection to peers
   */

  private server: net.Server | undefined

  /**
   * Represents the current connection to a peer
   */

  private connection: net.Socket | undefined
  private disconnectTimeout: (() => void) | undefined

  /**
   * Creates an instance of a XyoServerTcpNetwork
   *
   * @param port The port to bind to for incoming network requests
   */

  constructor (public port?: number) {
    super()
  }

  public setPort(port: number) {
    this.port = port
  }

  /**
   * Will attempt to locate peers. Once a peer is found the server will close
   * and not accept any more incoming connections.
   *
   * @param catalogue A peer-matchmaking delegate
   */

  public async find(catalogue: IXyoNetworkProcedureCatalogue): Promise<IXyoNetworkPipe> {
    /** Create a server and listen on port */
    this.server = net.createServer()
    this.server.listen(this.port, '0.0.0.0')

    /** Wait for a single XYO connection */
    const connectionResult = await this.getConnection(this.server, catalogue)

    /** Close the server to new connections while this one is handled */
    this.server.close()

    /** Clears state so this tcp-network instance can be used again */
    const onConnectionClose = () => {
      connectionResult.socket.removeListener('close', onConnectionClose)
      connectionResult.socket.removeListener('error', onConnectionError)
      this.connection = undefined
    }

    const onConnectionError = (err: Error) => {
      this.logInfo(`An error occurred on an open TCP connection`, err)
      this.connection = undefined
    }

    connectionResult.socket.on('close', onConnectionClose)

    connectionResult.socket.on('error', onConnectionError)

    return new XyoTcpNetworkPipe(connectionResult)
  }

  /**
   * Will stop the existing server so that it doesn't service any more
   * incoming connections. Importantly, existing connections can continue
   * to communicate. This promise returned by this function will one
   * resolve once all connections have ended.
   */

  public stopServer(): Promise<void> {
    if (this.server) {
      return new Promise((resolve, reject) => {
        if (this.server) {
          this.server.close((err: Error | undefined) => {
            if (err) {
              return reject(err)
            }

            return resolve()
          })
        }

        return resolve()
      })
    }

    return Promise.resolve()
  }

  /**
   * Builds a `XyoTcpConnectionResult` once was is available
   *
   * @param server The server that is being listened on
   * @param catalogue The peer-matchmaking catalogue
   */

  private getConnection(server: net.Server, catalogue: IXyoNetworkProcedureCatalogue): Promise<XyoTcpConnectionResult> {
    return new Promise((resolve, reject) => {
      const onConnection = (c: net.Socket) => {
        this.logInfo(`Server Connection made with ${c.remoteAddress || 'unknown ip'}`)

        if (this.connection) { // Prevents multiple connections
          this.logInfo(`Connection already exists, will close incoming connection`)
          c.end()
          return
        }

        this.connection = c
        this.scheduleDisconnect(c)

        // tslint:disable-next-line:ter-prefer-arrow-callback
        const onConnectionClose = (hasError: boolean) => {
          this.cancelDisconnect()
          this.connection = undefined
        }

        // tslint:disable-next-line:ter-prefer-arrow-callback
        const onError = (err: Error) => {
          this.logError(`An error error getting a connection`, err)
          this.cancelDisconnect()
          this.connection = undefined
        }

        c.on('close', onConnectionClose)
        c.on('error', onError)

        let data: Buffer | undefined
        let sizeOfPayload: number | undefined

        const onData = (chunk: Buffer) => {
          this.scheduleDisconnect(c)
          data = Buffer.concat([
            data || Buffer.alloc(0),
            chunk
          ])

          if (data.length < 4) {
            return
          }

          if (sizeOfPayload === undefined) {
            sizeOfPayload = data.readUInt32BE(0)
            this.logInfo(`Expecting message of size ${sizeOfPayload}`)
          }

          if (data.length > sizeOfPayload) { // too many, corrupt payload
            this.logInfo(`Hanging up, payload too big ${data.length}`)
            this.connection = undefined
            this.cancelDisconnect()
            c.destroy() // destroy because this might be an attack
            return
          }

          if (sizeOfPayload === data.length) {
            this.cancelDisconnect()
            c.removeListener('data', onData)
            c.removeListener('close', onConnectionClose)
            c.removeListener('error', onError)
            server.removeListener('connection', onConnection)
            this.connection = undefined

            // chop of the size that the client sent
            const dataReceivedWithoutSize = data.slice(4)
            console.log(dataReceivedWithoutSize)
            const tcpConnectResult = new XyoTcpConnectionResult(c, dataReceivedWithoutSize)
            return resolve(tcpConnectResult)
          }
        }

        c.on('data', onData)
      }

      server.on('connection', onConnection)
    })
  }

  private cancelDisconnect() {
    if (this.disconnectTimeout) {
      this.disconnectTimeout()
      this.disconnectTimeout = undefined
    }
  }

  private scheduleDisconnect(c: net.Socket) {
    this.cancelDisconnect()
    this.disconnectTimeout = XyoBase.timeout(() => {
      this.logInfo(`Connection timed out while negotiating`)
      this.connection = undefined
      c.end()
    }, 3000)
  }
}
