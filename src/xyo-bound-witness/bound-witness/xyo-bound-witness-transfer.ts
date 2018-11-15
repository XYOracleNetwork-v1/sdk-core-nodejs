/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 4:39:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-transfer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 4:52:52 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject, IXyoObject } from '../../xyo-core-components/xyo-object';

/**
 * This class is a simple data class meant to wrap the
 * transitional values of a `BoundWitness` exchange
 *
 * @major 0x02
 * @minor 0x0a
 */
export class XyoBoundWitnessTransfer extends XyoObject {

  public static major = 0x02;
  public static minor = 0x0a;

  /**
   * Creates a new instance of a XyoBoundWitnessTransfer
   *
   * @param keysToSend The collection of public keys to transfer
   * @param payloadsToSend The collection of payloads to transfer
   * @param signatureToSend The collection of signatures to sends
   */

  constructor(
    public readonly keysToSend: IXyoObject[],
    public readonly payloadsToSend: IXyoObject[],
    public readonly signatureToSend: IXyoObject[]
  ) {
    super(XyoBoundWitnessTransfer.major, XyoBoundWitnessTransfer.minor);
  }

  public getReadableName(): string {
    return 'bound-witness-transfer';
  }

  public getReadableValue() {
    return {
      stage: this.stage,
      keysToSend: this.keysToSend,
      payloadsToSend: this.payloadsToSend,
      signatureToSend: this.signatureToSend
    };
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
