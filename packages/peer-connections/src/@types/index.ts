/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 10:46:01 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 11:26:42 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe, CatalogueItem } from '@xyo-network/network'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'

/** A delegate for managing peer-connections */
export interface IXyoPeerConnectionDelegate {

  /** Handles a peer connection once it is provided */
  handlePeerConnection(networkPipe: IXyoNetworkPipe): Promise<void>

  /** Provides a connection to a peer */
  provideConnection(): Promise<IXyoNetworkPipe>

  /** Calling `stopProvidingConnections` will make it so that the delegate does not provide any future connections */
  stopProvidingConnections(): Promise<void>
}

/**
 * Allows multiplexing / routing based on a Category. Delegates
 * network communication to the handler
 */
export interface IXyoPeerConnectionHandler {
  /** Handles peer connection, handler should call `close` on the pipe when done handling */
  handlePeerConnection(
    networkPipe: IXyoNetworkPipe,
    choice: CatalogueItem | undefined,
    toChoose: CatalogueItem[] | undefined,
    didInit: boolean
  ): Promise<void>
}

/**
 * Allows for dynamic decision-making / control flow by an `XyoNode` as to which
 * category should be chosen given arbitrary criteria
 */

export interface IXyoCatalogueResolver {

/**
 * Should resolve to the particular category the node wishes to perform.
 * For example, if the catalogue-items are `GIVE_ORIGIN_CHAIN`, `BOUND_WITNESS`
 * an archivist would return `TAKE_ORIGIN_CHAIN`.
 */
  resolveCategory(catalogueItems: CatalogueItem[]): CatalogueItem | undefined
}

/**
 * Since all operations (currently) are done through XyoBoundWitnesses,
 * this interface allows routing and delegating to particular handlers
 * that resolve to an `XyoBoundWitness` which can then be handled in
 * a uniform way
 */
export interface IXyoBoundWitnessHandlerProvider {

  /** Given a `IXyoNetworkPipe` performs an operation that resolves to an `XyoBoundWitness` */
  handle(networkPipe: IXyoNetworkPipe, didInit: boolean, choice: CatalogueItem): Promise<IXyoBoundWitness | undefined>
}

/**
 * Provides basic routing functionality. Keys off a catalogue item
 */
export interface IXyoCategoryRouter {

  /** Optionally returns a `IXyoBoundWitnessHandlerProvider` based off the catalogueItem */
  getHandler(catalogueItem: CatalogueItem): IXyoBoundWitnessHandlerProvider | undefined
}
