/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 26th September 2018 3:01:22 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-client-tcp-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 1st November 2018 12:12:49 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  IXyoNetworkProvider,
  IXyoNetworkProcedureCatalogue,
  IXyoNetworkPipe,
  IXyoNetworkAddressProvider,
  IXyoTCPNetworkAddress
} from "../../@types/xyo-network";

import net from 'net';

import {
  CatalogueItem,
  catalogueItemsToMask,
  bufferToCatalogueItems
} from "../xyo-catalogue-item";

import {
  XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES,
  XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES,
  XYO_TCP_CATALOGUE_LENGTH_IN_BYTES
} from "./xyo-tcp-network-constants";

import {
  writeNumberToBuffer,
  readNumberFromBuffer
} from "../../xyo-core-components/xyo-buffer-utils";

import {
  XyoTcpConnectionResult
} from "./xyo-tcp-connection-result";

import {
  XyoBase
} from "../../xyo-core-components/xyo-base";

import {
  XyoTcpNetworkPipe
} from "./xyo-tcp-network-pipe";

/**
 * This is not a production-ready TCP client. It was built to test the TCP server.
 * At any rate, it does reliably meet the tcp client functionality.
 */

export class XyoClientTcpNetwork extends XyoBase implements IXyoNetworkProvider {

  /** A promise that gets called when stopping the run loop */
  private shouldStopPromise: (() => void) | undefined = undefined;

  /** True if looping, false otherwise */
  private isLooping = false;

  /**
   * Creates an instance of XyoClientTcpNetwork.
   *
   * @param {IXyoNetworkAddressProvider} networkAddressProvider Used to discover servers to try gain connections to
   * @memberof XyoClientTcpNetwork
   */

  constructor (private readonly networkAddressProvider: IXyoNetworkAddressProvider) {
    super();
  }

  /**
   * Attempts to find tcp-network servers compatible with `catalogue` passed in
   *
   * @param {IXyoNetworkProcedureCatalogue} catalogue A catalogue of items the consumer can perform
   *
   * @returns {Promise<IXyoNetworkPipe>} The promise will be resolve once a network-pipe is created, which may be never
   * @memberof XyoClientTcpNetwork
   */

  public async find(catalogue: IXyoNetworkProcedureCatalogue): Promise<IXyoNetworkPipe> {
    this.logInfo(`Attempting to find peers`);

    // Start looping and resolve promise once a network pipe is created
    return new Promise((resolve, reject) => {
      this.loop(catalogue, resolve, reject);
    }) as Promise<IXyoNetworkPipe>;
  }

  /** Stops the client-tcp-network from trying to find peers */
  public stopServer(): Promise<void> {
    if (!this.isLooping) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (!this.isLooping) {
        return resolve();
      }

      // Set shouldStopPromise so that when the run-loops sees this and calls it
      this.shouldStopPromise = () => {
        this.shouldStopPromise = undefined; // unset
        resolve();
      };
    }) as Promise<void>;
  }

  /** The primary looping function the client-tcp-network performs to try to find a peer */
  private async loop(
    catalogue: IXyoNetworkProcedureCatalogue,
    resolve: (networkPipe: IXyoNetworkPipe) => void,
    reject: (error?: any) => void
  ) {
    this.logInfo(`Run loop entered`);

    if (this.shouldStopPromise) { // If shouldStopPromise is set, exit loop
      this.logInfo(`Run loop will end`);
      this.isLooping = false;
      reject(); // reject, could not find peer
      this.shouldStopPromise();
    }

    this.logInfo(`Will try to find next address`);

    const nextAddress = await this.networkAddressProvider.next(); // get next networkAddress to try
    if (!nextAddress) { // If no networkWork address is available, pause for 1sec, then loop again
      return setTimeout(() => {
        this.loop(catalogue, resolve, reject);
      }, 1000);
    }

    try {
      // Try to get connection, will throw an error if it does not succeed
      const connectionResult = await this.getConnection(nextAddress, catalogue);
      return resolve(new XyoTcpNetworkPipe(connectionResult));
    } catch (err) {
      this.logError(`There was an error creating client connection`, err);
      // Take 1sec break an try again
      return setTimeout(() => {
        this.loop(catalogue, resolve, reject);
      }, 1000);
    }
  }

  /** Try to establish a connection for a given networkAddress */
  private getConnection(nextAddress: IXyoTCPNetworkAddress, catalogue: IXyoNetworkProcedureCatalogue) {
    return new Promise((resolve, reject) => {
      const client = net.createConnection(nextAddress.port, nextAddress.host, () => {
        this.logInfo(`Client Connection made with ${nextAddress.host}:${nextAddress.port}`);
        const mask = catalogueItemsToMask(catalogue.getCurrentCatalogue());
        const maskBuffer = Buffer.alloc(4);

        maskBuffer.writeUInt32BE(mask, 0);

        const catalogueSizeBuffer = writeNumberToBuffer(
          XYO_TCP_CATALOGUE_LENGTH_IN_BYTES,
          XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES,
          false
        );

        const tcpSizeBuffer = writeNumberToBuffer(
          XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES + XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES + maskBuffer.length,
          XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES,
          false
        );

        const negotiationBuffer = Buffer.concat([
          tcpSizeBuffer,
          catalogueSizeBuffer,
          maskBuffer
        ]);

        client.write(negotiationBuffer);
      });

      const onError = (err: any) => {
        this.logError(`An error occurred while getting connection`, err);
        reject(err);
      };

      client.on('error', onError);

      let data: Buffer | undefined;
      let sizeOfPayload: number | undefined;
      let otherCatalogueItems: CatalogueItem[] | undefined;
      let validCatalogueItems: CatalogueItem[] | undefined;
      let sizeOfCatalogue: number | undefined;

      // tslint:disable-next-line:ter-prefer-arrow-callback
      async function onData(chunk: Buffer) {
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
            client.end();
            return;
          }

          validCatalogueItems = otherCatalogueItems.filter(catalogueItem => catalogue.canDo(catalogueItem));

          if (validCatalogueItems.length === 0) { // exit early if it its not in the catalogue
            client.end();
            return;
          }
        }

        if (sizeOfPayload === data.length) {
          client.removeListener('data', onData);
          client.removeListener('err', onData);

          const appDataIndex = readNumberFromBuffer(
            data,
            XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES,
            false,
            XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES
          );

          const appDataStartIndex = XYO_TCP_CATALOGUE_LENGTH_IN_BYTES +
            XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES +
            appDataIndex;

          const appTransfer = data.slice(appDataStartIndex);

          resolve(new XyoTcpConnectionResult(client, appTransfer, validCatalogueItems || []));
        }
      }

      client.on('data', onData);
    }) as Promise<XyoTcpConnectionResult>;
  }
}
