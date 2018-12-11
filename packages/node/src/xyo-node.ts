/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 10:44:20 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 7th December 2018 11:45:18 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoPeerConnectionDelegate } from '@xyo-network/peer-connections'
import { XyoBase } from '@xyo-network/base'

/**
 * An XyoNode represents a node in the xyo-network system.
 * A node can communicate with other nodes, in general, through
 * bound-witness interactions. What differentiates a sentinel
 * from a bridge from an archivist is their role in the system
 * and what their prerogative is at any given time.
 */

export class XyoNode extends XyoBase {

  /** Some instance variables for managing the xyo-node loop */
  private isLooping = false
  private shouldStopLooping = false

  constructor(private readonly peerConnectionDelegate: IXyoPeerConnectionDelegate) {
    super()
  }

  /**
   * Calling start will place the xyo-node in loop mode
   */
  public start() {
    this.loop()
  }

  /**
   * Calling stop will remove the xyo-node from loop mode
   */

  public stop() {
    this.shouldStopLooping = true
    return this.peerConnectionDelegate.stopProvidingConnections()
  }

  /**
   * Defines an xyo-node's in loop. Once an iteration of the loop is completed it will
   * scheduled immediately for another iteration of the loop unless `stop` is called.
   */

  private async loop() {
    if (this.isLooping && this.shouldStopLooping) {
      return
    }

    try {
      const networkPipe = await this.peerConnectionDelegate.provideConnection()
      await this.peerConnectionDelegate.handlePeerConnection(networkPipe)
    } catch (err) {
      this.logError(`There was an uncaught error in the xyo-node loop`, err)
    }

    setImmediate(this.loop.bind(this))
  }
}
