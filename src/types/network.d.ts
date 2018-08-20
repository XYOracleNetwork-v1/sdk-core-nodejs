/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 20th August 2018 12:29:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: listener.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 20th August 2018 1:00:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IListenerConnection {
  send(data: any, encoding: string): Promise<any>;
  disconnect(): Promise<boolean>;
}

export interface IReceiver {
  onDataReceive(data: any, encoding: string): Promise<any>;
}

export interface INetwork {
  registerReceiver(id: string, receiver: IReceiver): boolean;
  requestConnection(id: string): Promise<IListenerConnection|null>;
}