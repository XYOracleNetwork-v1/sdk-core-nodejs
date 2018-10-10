/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 6th September 2018 12:54:21 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-network-interfaces.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:11:00 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { CatalogueItem } from '../xyo-network/xyo-catalogue-item';

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
  getTemporaryPeerId(): Buffer;
}

/**
 * An interface that allows the network to delegate to implementer of
 * this interface as to which operations the xyo-node supports
 */
export interface IXyoNetworkProcedureCatalogue {
  canDo(catalogueItem: CatalogueItem): boolean;
  getCurrentCatalogue(): CatalogueItem[];
}

/**
 * An XyoNetworkPipe is communicate channel between two
 * nodes and will be used the fundamental way that two
 * nodes communicate with one another
 */
export interface IXyoNetworkPipe {
  /** The peer on the other side of the pipe */
  peer: IXyoNetworkPeer;

  /** The catalogue of operations that the peer can perform */
  otherCatalogue: CatalogueItem[] | undefined;

  /** Any data that was initially passed to start an interaction */
  initiationData: Buffer | undefined;

  /** A consumer may register a handler for when the other peer disconnects */
  onPeerDisconnect(callback: (hasError: boolean) => void): () => void;

  /** Sends message to the peer. If awaitResponse is true it will wait for a message from the other node */
  send (data: Buffer, awaitResponse?: boolean): Promise<Buffer | undefined>;

  /** Closes the connection to the peer */
  close(): Promise<void>;
}

export interface IXyoNetworkProviderInterface {
  find(catalogue: IXyoNetworkProcedureCatalogue): Promise<IXyoNetworkPipe>;
  stopServer(): Promise<void>;
}

export interface IXyoNetworkAddressProvider {
  next(): Promise<{host: string, port: number}>;
}
