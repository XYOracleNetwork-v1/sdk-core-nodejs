/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 6th September 2018 12:49:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-tcp-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 21st November 2018 10:13:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  IXyoNetworkProvider,
  IXyoNetworkProcedureCatalogue,
  IXyoNetworkPipe,
  CatalogueItem,
  bufferToCatalogueItems,
  CATALOGUE_SIZE_OF_SIZE_BYTES,
  CATALOGUE_SIZE_OF_PAYLOAD_BYTES
} from '@xyo-network/network'

import { XyoTcpConnectionResult } from './xyo-tcp-connection-result'
import { XyoTcpNetworkPipe } from './xyo-tcp-network-pipe'

import net from 'net'
import { XyoBase } from '@xyo-network/base'
import { readNumberFromBuffer } from '@xyo-network/buffer-utils'

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
  private disconnectTimeout: NodeJS.Timeout | undefined

  /**
   * Creates an instance of a XyoServerTcpNetwork
   *
   * @param port The port to bind to for incoming network requests
   */

  constructor (public readonly port: number) {
    super()
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
    this.logInfo(`Listening on port ${this.port} for incoming connections`)

    /** Wait for a single XYO connection */
    const connectionResult = await this.getConnection(this.server, catalogue)

    /** Close the server to new connections while this one is handled */
    this.server.close(() => {
      this.logInfo(`Server closed`)
    })

    /** Clears state so this tcp-network instance can be used again */
    const onConnectionClose = () => {
      this.logInfo(`Xyo TCP Connection closed`)
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
        let sizeOfCatalogue: number | undefined
        let otherCatalogueItems: CatalogueItem[] | undefined
        let validCatalogueItems: CatalogueItem[] | undefined

        const onData = (chunk: Buffer) => {
          this.scheduleDisconnect(c)
          data = Buffer.concat([
            data || Buffer.alloc(0),
            chunk
          ])

          if (data.length < CATALOGUE_SIZE_OF_PAYLOAD_BYTES) {
            return
          }

          if (sizeOfPayload === undefined) {
            sizeOfPayload = data.readUInt32BE(0)
          }

          if (data.length < CATALOGUE_SIZE_OF_PAYLOAD_BYTES + CATALOGUE_SIZE_OF_SIZE_BYTES) {
            return
          }

          if (sizeOfCatalogue === undefined) {
            sizeOfCatalogue = data.readUInt8(CATALOGUE_SIZE_OF_PAYLOAD_BYTES)
          }

          if (
            otherCatalogueItems === undefined &&
            data.length >= (CATALOGUE_SIZE_OF_PAYLOAD_BYTES + sizeOfCatalogue)
          ) {
            otherCatalogueItems = bufferToCatalogueItems(
              data.slice(
                CATALOGUE_SIZE_OF_PAYLOAD_BYTES + CATALOGUE_SIZE_OF_SIZE_BYTES,
                CATALOGUE_SIZE_OF_PAYLOAD_BYTES + CATALOGUE_SIZE_OF_SIZE_BYTES + sizeOfCatalogue
              )
            )
            if (otherCatalogueItems.length < 1) {
              this.connection = undefined
              this.cancelDisconnect()
              c.end()
              return
            }

            validCatalogueItems = otherCatalogueItems.filter(catalogueItem => catalogue.canDo(catalogueItem))

            if (validCatalogueItems.length === 0) { // exit early if it its not in the catalogue
              this.connection = undefined
              this.cancelDisconnect()
              c.end()
              return
            }
          }

          if (sizeOfPayload === data.length) {
            this.cancelDisconnect()
            c.removeListener('data', onData)
            c.removeListener('close', onConnectionClose)
            c.removeListener('error', onError)
            server.removeListener('connection', onConnection)
            this.connection = undefined
            const appDataIndex = readNumberFromBuffer(
              data,
              CATALOGUE_SIZE_OF_SIZE_BYTES,
              false,
              CATALOGUE_SIZE_OF_PAYLOAD_BYTES + CATALOGUE_SIZE_OF_SIZE_BYTES
            )

            const trimmedData: Buffer = data.slice(
              CATALOGUE_SIZE_OF_PAYLOAD_BYTES +
              CATALOGUE_SIZE_OF_SIZE_BYTES +
              appDataIndex
            )

            return resolve(new XyoTcpConnectionResult(c, trimmedData, validCatalogueItems || []))
          }
        }

        c.on('data', onData)
      }

      server.on('connection', onConnection)
    })
  }

  private cancelDisconnect() {
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout)
      this.disconnectTimeout = undefined
    }
  }

  private scheduleDisconnect(c: net.Socket) {
    this.cancelDisconnect()
    this.disconnectTimeout = setTimeout(() => {
      this.logInfo(`Connection timed out while negotiating`)
      this.connection = undefined
      c.end()
    }, 3000)
  }
}
