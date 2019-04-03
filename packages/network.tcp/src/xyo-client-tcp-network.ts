/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 26th September 2018 3:01:22 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-client-tcp-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 2:56:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  IXyoNetworkAddressProvider,
  IXyoTCPNetworkAddress
} from "./@types"

import net from 'net'

import {
  IXyoNetworkProvider,
  IXyoNetworkProcedureCatalogue,
  IXyoNetworkPipe,
} from "@xyo-network/network"

import {
  XyoTcpConnectionResult
} from "./xyo-tcp-connection-result"

import {
  XyoBase
} from "@xyo-network/base"

import {
  XyoTcpNetworkPipe
} from "./xyo-tcp-network-pipe"

/**
 * This is not a production-ready TCP client. It was built to test the TCP server.
 * At any rate, it does reliably meet the tcp client functionality.
 */

export class XyoClientTcpNetwork extends XyoBase implements IXyoNetworkProvider {

  /** A promise that gets called when stopping the run loop */
  private shouldStopPromise: (() => void) | undefined = undefined

  /** True if looping, false otherwise */
  private isLooping = false

  /**
   * Creates an instance of XyoClientTcpNetwork.
   *
   * @param {IXyoNetworkAddressProvider} networkAddressProvider Used to discover servers to try gain connections to
   * @memberof XyoClientTcpNetwork
   */

  constructor (private readonly networkAddressProvider: IXyoNetworkAddressProvider) {
    super()
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
    this.logInfo(`Attempting to find peers`)

    // Start looping and resolve promise once a network pipe is created
    return new Promise((resolve, reject) => {
      this.loop(catalogue, resolve, reject)
    }) as Promise<IXyoNetworkPipe>
  }

  /** Stops the client-tcp-network from trying to find peers */
  public stopServer(): Promise<void> {
    if (!this.isLooping) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      if (!this.isLooping) {
        return resolve()
      }

      // Set shouldStopPromise so that when the run-loops sees this and calls it
      this.shouldStopPromise = () => {
        this.shouldStopPromise = undefined // unset
        resolve()
      }
    }) as Promise<void>
  }

  /** The primary looping function the client-tcp-network performs to try to find a peer */
  private async loop(
    catalogue: IXyoNetworkProcedureCatalogue,
    resolve: (networkPipe: IXyoNetworkPipe) => void,
    reject: (error?: any) => void
  ) {
    this.logInfo(`Run loop entered`)

    if (this.shouldStopPromise) { // If shouldStopPromise is set, exit loop
      this.logInfo(`Run loop will end`)
      this.isLooping = false
      reject() // reject, could not find peer
      this.shouldStopPromise()
      return
    }

    this.logInfo(`Will try to find next address`)

    const nextAddress = await this.networkAddressProvider.next() // get next networkAddress to try
    if (!nextAddress) { // If no networkWork address is available, pause for 1sec, then loop again
      XyoBase.timeout(() => {
        this.loop(catalogue, resolve, reject)
      }, 1000)
      return
    }

    try {
      // Try to get connection, will throw an error if it does not succeed
      const connectionResult = await this.getConnection(nextAddress, catalogue)
      return resolve(new XyoTcpNetworkPipe(connectionResult))
    } catch (err) {
      this.logError(`There was an error creating client connection`, err)
      // Take 1sec break an try again
      XyoBase.timeout(() => {
        this.loop(catalogue, resolve, reject)
      }, 5000)
      return
    }
  }

  /** Try to establish a connection for a given networkAddress */
  private async getConnection(nextAddress: IXyoTCPNetworkAddress, catalogue: IXyoNetworkProcedureCatalogue) {

    const client = await net.createConnection(nextAddress.port, nextAddress.host, () => {
      this.logInfo(`Client Connection made with ${nextAddress.host}:${nextAddress.port}`)
    })

    const onError = (err: any) => {
      this.logError(`An error occurred while getting connection`, err)
    }

    // const onConnect

    client.on('error', onError)
    // client.on('connect')

    return new XyoTcpConnectionResult(client, undefined)
  }
}
