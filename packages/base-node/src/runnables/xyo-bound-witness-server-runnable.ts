/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Monday, 4th March 2019 1:12:08 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-server-runnable.ts
 
 * @Last modified time: Wednesday, 13th March 2019 4:00:10 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoRunnable, providerFn } from "@xyo-network/utils"
import { IXyoPeerConnectionDelegate } from "@xyo-network/peer-connections"

export class XyoBoundWitnessServerRunnable extends XyoBase implements IXyoRunnable {
  public readonly type = "loop"
  private peerConnectionDelegate: IXyoPeerConnectionDelegate | undefined

  constructor(private readonly peerConnectionDelegateProvider: providerFn<IXyoPeerConnectionDelegate>) {
    super()
  }

  public getSleepTime(): number {
    return 0 // its a server, doesn't sleep
  }

  public async initialize(): Promise<void> {
    this.logInfo(`Initializing BoundWitnessServerRunnable loop`)
    this.peerConnectionDelegate = await this.peerConnectionDelegateProvider()
  }

  public async run(): Promise<void> {
    if (!this.peerConnectionDelegate) {
      this.peerConnectionDelegate = await this.peerConnectionDelegateProvider()
    }

    const networkPipe = await this.peerConnectionDelegate.provideConnection()
    await this.peerConnectionDelegate.handlePeerConnection(networkPipe)
  }

  public async stop(): Promise<void> {
    if (!this.peerConnectionDelegate) return

    await this.peerConnectionDelegate.stopProvidingConnections()
  }

}
