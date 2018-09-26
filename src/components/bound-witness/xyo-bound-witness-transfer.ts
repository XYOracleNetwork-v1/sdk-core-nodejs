/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 4:39:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-transfer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 26th September 2018 12:50:57 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';

/**
 * This class is a simple data class meant to wrap the
 * transitional values of a `BoundWitness` exchange
 *
 * @major 0x02
 * @minor 0x0a
 */
export class XyoBoundWitnessTransfer extends XyoObject {

  /**
   * Creates a new instance of a XyoBoundWitnessTransfer
   *
   * @param keysToSend The collection of public keys to transfer
   * @param payloadsToSend The collection of payloads to transfer
   * @param signatureToSend The collection of signatures to sends
   */

  constructor(
    public readonly keysToSend: XyoObject[],
    public readonly payloadsToSend: XyoObject[],
    public readonly signatureToSend: XyoObject[]
  ) {
    super(0x02, 0x0A);
  }

  /**
   * @returns The particular stage of the transfer. Valid values are 1,2, or 3
   */

  public get stage() {
    if (this.keysToSend.length > 0 && this.payloadsToSend.length > 0 && this.signatureToSend.length === 0) {
      return 0x01;
    }

    if (this.keysToSend.length > 0 && this.payloadsToSend.length > 0 && this.signatureToSend.length > 0) {
      return 0x02;
    }

    if (this.keysToSend.length === 0 && this.payloadsToSend.length === 0 && this.signatureToSend.length > 0) {
      return 0x03;
    }

    return 0x01;
  }
}
