/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 6th September 2018 12:49:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-tcp-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 26th September 2018 4:25:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNetworkProviderInterface, XyoNetworkProcedureCatalogue, XyoNetworkPipe } from '../xyo-network';
import { bufferToCatalogueItems, CatalogueItem } from '../xyo-catalogue-item';
import { XyoTcpConnectionResult } from './xyo-tcp-connection-result';
import { XyoTcpNetworkPipe } from './xyo-tcp-network-pipe';
import { XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES, XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES } from './xyo-tcp-network-constants';

import net from 'net';
import { XyoBase } from '../../components/xyo-base';
import { readNumberFromBuffer } from '../../utils/xyo-buffer-utils';

/**
 * A network provider build on top of the TCP/IP stack.
 * This implementation may seem peculiar because there is a
 * great deal of effort to ensure that there is never more than
 * one `meaningful` connection made to a peer.
 */

export class XyoServerTcpNetwork extends XyoBase implements XyoNetworkProviderInterface {

  /**
   * An ephemeral short lived server for making connection to peers
   */

  private server: net.Server | undefined;

  /**
   * Represents the current connection to a peer
   */

  private connection: net.Socket | undefined;

  /**
   * Creates an instance of a XyoServerTcpNetwork
   *
   * @param port The port to bind to for incoming network requests
   */

  constructor (public readonly port: number) {
    super();
  }

  /**
   * Will attempt to locate peers. Once a peer is found the server will close
   * and not accept any more incoming connections.
   *
   * @param catalogue A peer-matchmaking delegate
   */

  public async find(catalogue: XyoNetworkProcedureCatalogue): Promise<XyoNetworkPipe> {
    /** Create a server and listen on port */
    this.server = net.createServer();
    this.server.listen(this.port);

    /** Wait for a single XYO connection */
    const connectionResult = await this.getConnection(this.server, catalogue);

    /** Close the server to new connections while this one is handled */
    this.server.close(() => {
      this.logInfo(`Server closed`);
    });

    /** Clears state so this tcp-network instance can be used again */
    connectionResult.socket.on('close', () => {
      this.logInfo(`Xyo TCP Connection closed`);
      this.connection = undefined;
    });

    return new XyoTcpNetworkPipe(connectionResult);
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
              return reject(err);
            }

            return resolve();
          });
        }

        return resolve();
      });
    }

    return Promise.resolve();
  }

  /**
   * Builds a `XyoTcpConnectionResult` once was is available
   *
   * @param server The server that is being listened on
   * @param catalogue The peer-matchmaking catalogue
   */

  private getConnection(server: net.Server, catalogue: XyoNetworkProcedureCatalogue): Promise<XyoTcpConnectionResult> {
    return new Promise((resolve, reject) => {
      const onConnection = (c: net.Socket) => {
        this.logInfo(`Connection made`);

        if (this.connection) { // Prevents multiple connections
          this.logInfo(`Connection already exists, will close incoming connection`);
          c.end();
          return;
        }

        this.connection = c;

        // tslint:disable-next-line:ter-prefer-arrow-callback
        const onConnectionClose = (hasError: boolean) => {
          this.logInfo(this, hasError);
          this.connection = undefined;
        };

        c.on('close', onConnectionClose);

        let data: Buffer | undefined;
        let sizeOfPayload: number | undefined;
        let sizeOfCatalogue: number | undefined;
        let otherCatalogueItems: CatalogueItem[] | undefined;
        let validCatalogueItems: CatalogueItem[] | undefined;

        const onData = (chunk: Buffer) => {
          data = Buffer.concat([
            data || Buffer.alloc(0),
            chunk
          ]);

          if (data.length < XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES) {
            return;
          }

          if (sizeOfPayload === undefined) {
            sizeOfPayload = data.readUInt32BE(0);
          }

          if (data.length < XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES + XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES) {
            return;
          }

          if (sizeOfCatalogue === undefined) {
            sizeOfCatalogue = data.readUInt8(XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES);
          }

          if (
            otherCatalogueItems === undefined &&
            data.length >= (XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES + sizeOfCatalogue)
          ) {
            otherCatalogueItems = bufferToCatalogueItems(
              data.slice(
                XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES + XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES,
                XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES + XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES + sizeOfCatalogue
              )
            );
            if (otherCatalogueItems.length < 1) {
              this.connection = undefined;
              c.end();
              return;
            }

            validCatalogueItems = otherCatalogueItems.filter(catalogueItem => catalogue.canDo(catalogueItem));

            if (validCatalogueItems.length === 0) { // exit early if it its not in the catalogue
              this.connection = undefined;
              c.end();
              return;
            }
          }

          if (sizeOfPayload === data.length) {
            c.removeListener('data', onData);
            c.removeListener('close', onConnectionClose);
            server.removeListener('connection', onConnection);
            this.connection = undefined;
            const appDataIndex = readNumberFromBuffer(
              data,
              XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES,
              false,
              XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES + XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES
            );

            const trimmedData: Buffer = data.slice(
              XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES +
              XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES +
              appDataIndex
            );

            return resolve(new XyoTcpConnectionResult(c, trimmedData, validCatalogueItems || []));
          }
        };

        c.on('data', onData);
      };

      server.on('connection', onConnection);
    });
  }
}
