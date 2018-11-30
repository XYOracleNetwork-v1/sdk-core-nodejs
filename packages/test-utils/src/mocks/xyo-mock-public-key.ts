/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:44:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 4:45:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoPublicKey } from "@xyo-network/signing"

export class XyoMockPublicKey implements IXyoPublicKey {
  public schemaObjectId = 0x10

  constructor(private readonly publicKeyHexString: string) {}

  public getRawPublicKey(): Buffer {
    return Buffer.from(this.publicKeyHexString, 'hex')
  }

  public serialize(): Buffer {
    return this.getRawPublicKey()
  }
}
