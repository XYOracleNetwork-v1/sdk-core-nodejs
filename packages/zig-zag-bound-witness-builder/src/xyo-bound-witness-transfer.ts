/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 2:02:13 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-transfer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 19th November 2018 3:18:49 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base";
import { IXyoPublicKey, IXyoSignature } from "@xyo-network/signing";
import { IXyoPayload } from '@xyo-network/bound-witness';

export class XyoBoundWitnessTransfer extends XyoBase {

  /**
   * Creates a new instance of a XyoBoundWitnessTransfer
   *
   * @param keysToSend The collection of public keys to transfer
   * @param payloadsToSend The collection of payloads to transfer
   * @param signatureToSend The collection of signatures to sends
   */

  constructor(
    public readonly keysToSend: IXyoPublicKey[][],
    public readonly payloadsToSend: IXyoPayload[],
    public readonly signatureToSend: IXyoSignature[][]
  ) {
    super();
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