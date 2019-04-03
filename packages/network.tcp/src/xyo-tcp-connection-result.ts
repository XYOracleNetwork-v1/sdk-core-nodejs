/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 11:42:46 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-tcp-connection-result.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 10:25:28 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import net from 'net'

/**
 * A simple data-encapsulation class meant to represent the
 * end state of a successful negotiation
 */

export class XyoTcpConnectionResult {

  /** An id given to the socket that should be the same if it belongs to the same client across multiple requests */
  public readonly socketId: Buffer

  /**
   * Creates a new instance of a XyoTcpConnectionResult
   *
   * @param socket The socket underpinning the TCP connection
   * @param data The payload of everything from the tcp request, outside the tcp protocol sizing headers
   */

  constructor (
    public socket: net.Socket,
    public initiationData: Buffer | undefined,
  ) {

    this.socketId = Buffer.from(socket.remoteAddress || 'unknown')
  }
}
