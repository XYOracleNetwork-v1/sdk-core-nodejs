/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 20th August 2018 12:42:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: in-memory.network.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 3:57:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { INetwork,  IReceiver, IListenerConnection } from '../types/network';

/**
 * An `InMemoryNetwork` is an in-memory implementation of INetwork.
 * It provides the hooks for `Receiver` and `Listener` consumer via
 * an internal message bus
 */
export class InMemoryNetwork implements INetwork {

  /** Map of ids to Receivers */
  private readonly receivers: {[s: string]: IReceiver} = {};

  /**
   * Will register a receiver to listen at the id specified
   *
   * @param id The id to listen on
   * @param receiver The receiver that will handle incoming messages.
   * @returns Will return true if the receiver can listen at the address, false otherwise
   */

  public registerReceiver(id: string, receiver: IReceiver): boolean {
    if (this.receivers[id]) {
      return false;
    }

    this.receivers[id] = receiver;
    return true;
  }

  /**
   * Requests a connection from the network to a given id.
   *
   * @param id The id to listen on
   * @returns Will returns an IListenerConnection that can be used to send messages
   *          to the receivers specified by the `id` parameter
   */

  public async requestConnection(id: string): Promise<IListenerConnection|null> {
    const targetReceiver = this.receivers[id];

    if (!targetReceiver) {
      return Promise.resolve(null);
    }

    let connection: IListenerConnection|undefined = {
      send: (data: any, encoding: string) => {
        return targetReceiver.onDataReceive(data, encoding);
      },
      disconnect: () => {
        connection = undefined;
        return Promise.resolve(true);
      }
    };

    return Promise.resolve(connection);
  }
}
