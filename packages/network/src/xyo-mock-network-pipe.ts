/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:23:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-network-pipe.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 9:34:57 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe, IXyoNetworkPeer } from './@types'
import { CatalogueItem } from './catalogue-item'
import { IXyoSerializableObject } from "@xyo-network/serialization"

export class XyoMockNetworkPipe implements IXyoNetworkPipe {
  public networkHeuristics: IXyoSerializableObject[] = []

  public sendCount = 0
  // @ts-ignore
  public peer: IXyoNetworkPeer = {}

  // @ts-ignore
  public initiationData: Buffer

  constructor(
    private readonly intercepts: { [s: string]: (data: Buffer, awaitResponse?: boolean) => Promise<Buffer>},
    private readonly expectedMessages: Buffer[]
  ) {}

  public onPeerDisconnect(callback: (hasError: boolean) => void): () => void {
    // tslint:disable-next-line:no-empty
    return () => { }
  }

  public async send(data: Buffer, awaitResponse?: boolean): Promise<Buffer> {
    const expected = this.expectedMessages.length > this.sendCount ? this.expectedMessages[this.sendCount] : undefined
    if (expected) {
      expect(expected.equals(data)).toBe(true)
    }

    const returnMsg = (
      this.intercepts[this.sendCount] && this.intercepts[this.sendCount](data, awaitResponse)
    ) || Buffer.alloc(0)

    this.sendCount += 1

    return returnMsg
  }

  public async close(): Promise<void> {
    return
  }
}
