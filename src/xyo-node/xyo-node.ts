/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th September 2018 9:54:53 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-archivist.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:05:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPeerConnectionDelegateInterface } from '../@types/xyo-node';
import { XyoBase } from '../xyo-core-components/xyo-base';

/**
 * An XyoNode represents a node in the xyo-network system.
 * A node can communicate with other nodes, in general, through
 * bound-witness interactions. What differentiates a sentinel
 * from a bridge from an archivist is their role in the system
 * and what their prerogative is at any given time.
 */

export class XyoNode extends XyoBase {

  /** Some instance variables for managing the xyo-node loop */
  private isLooping: boolean = false;
  private shouldStopLooping: boolean = false;

  constructor(private readonly peerConnectionDelegate: XyoPeerConnectionDelegateInterface) {
    super();
  }

  /**
   * Calling start will place the xyo-node in loop mode
   */
  public start() {
    this.loop();
  }

  /**
   * Calling stop will remove the xyo-node from loop mode
   */

  public stop() {
    this.shouldStopLooping = true;
    return this.peerConnectionDelegate.stopProvidingConnections();
  }

  /**
   * Defines an xyo-node's in loop. Once an iteration of the loop is completed it will
   * scheduled immediately for another iteration of the loop unless `stop` is called.
   */

  private async loop() {
    if (this.isLooping && this.shouldStopLooping) {
      return;
    }

    this.logInfo(`Starting XyoArchivist loop`);

    const networkPipe = await this.peerConnectionDelegate.provideConnection();
    await this.peerConnectionDelegate.handlePeerConnection(networkPipe);
    setImmediate(this.loop.bind(this));
  }
}
