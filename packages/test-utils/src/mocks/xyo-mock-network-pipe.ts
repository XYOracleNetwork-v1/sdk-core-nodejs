/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:23:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-network-pipe.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 4:26:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe, IXyoNetworkPeer, CatalogueItem } from '@xyo-network/network'

export class XyoMockNetworkPipe implements IXyoNetworkPipe {
  public sendCount = 0
  // @ts-ignore
  public peer: IXyoNetworkPeer = {}

  // @ts-ignore
  public otherCatalogue: CatalogueItem[]

  // @ts-ignore
  public initiationData: Buffer

  constructor(
    private readonly intercepts: { [s: string]: (data: Buffer, awaitResponse?: boolean) => Promise<Buffer>},
    private readonly expectedMessages: Buffer[]
  ) {}

  public onPeerDisconnect(callback: (hasError: boolean) => void): () => void {
    return () => {
      console.log(`called`)
    }
  }

  public async send(data: Buffer, awaitResponse?: boolean): Promise<Buffer> {
    console.log(this.sendCount, data.toString('hex'))

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
