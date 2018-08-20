/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 20th August 2018 12:42:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: in-memory.network.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 20th August 2018 2:59:42 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { INetwork,  IReceiver, IListenerConnection } from '../types/network';

export class InMemoryNetwork implements INetwork {

  private readonly receivers: {[s: string]: IReceiver} = {};

  public registerReceiver(id: string, receiver: IReceiver): boolean {
    if (this.receivers[id]) {
      return false;
    }

    this.receivers[id] = receiver;
    return true;
  }

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
