/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 11th December 2018 9:32:12 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th February 2019 1:28:35 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { CatalogueItem } from "../catalogue-item"
import { IXyoSerializableObject } from "@xyo-network/serialization"

/**
 * The necessary communication interfaces that xyo-nodes will
 * use to communicate to other nodes on a `network`
 */

/**
 * A peer, meant to represent the meaningful attributes of the
 * node on the other side of the network pipe
 */
export interface IXyoNetworkPeer {

  /**
   * Returns an id for a peer that should be consistent across multiple connections
   * to the same node
   */
  getTemporaryPeerId(): Buffer
}

/**
 * An interface that allows the network to delegate to implementer of
 * this interface as to which operations the xyo-node supports
 */
export interface IXyoNetworkProcedureCatalogue {

  /**
   * Since not all operations are symmetric, a `canDo` interface
   * is required so that an XyoNode can agree to partake in operation
   * where one party is one role and the other party is the other role.
   *
   * For example, an archivist can take origin-chains but does not
   * want to give origin-chains. So if an archivist is queried with
   * `canDo(TAKE_ORIGIN_CHAIN)` it should return true
   */

  canDo(catalogueItem: CatalogueItem): boolean

  /**
   * The list of current `CatalogueItems` the `XyoNode` can perform
   */

  getCurrentCatalogue(): CatalogueItem[]

  setCatalogue(catalogue: CatalogueItem[]): void
}

/**
 * An XyoNetworkPipe is a communication channel between two
 * nodes and will be used the fundamental way that two
 * nodes communicate with one another
 */
export interface IXyoNetworkPipe {

  /** A representation of the peer on the other side of the pipe */
  peer: IXyoNetworkPeer

  /** Any data that was initially passed to start an interaction */
  initiationData: Buffer | undefined

  networkHeuristics: IXyoSerializableObject[]

  /** A consumer may register a handler for when the other peer disconnects */
  onPeerDisconnect(callback: (hasError: boolean) => void): () => void

  /** Sends message to the peer. If awaitResponse is true it will wait for a message from the other node */
  send (data: Buffer, awaitResponse?: boolean): Promise<Buffer | undefined>

  /** Closes the connection to the peer */
  close(): Promise<void>

}

/**
 * A network-provider will try to find peers who are compatible with the catalogue passed in.
 * Once a peer is found, it returns a pipe to send messages on.
 */
export interface IXyoNetworkProvider {

  /** Attempts to find a peer with a compatible catalogue. */
  find(catalogue: IXyoNetworkProcedureCatalogue): Promise<IXyoNetworkPipe>

  /** Tells the network-provider to stop finding peers */
  stopServer(): Promise<void>
}
