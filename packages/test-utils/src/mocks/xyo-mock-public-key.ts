/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:44:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 3rd December 2018 9:30:40 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoPublicKey } from "@xyo-network/signing"
import { schema } from "@xyo-network/serialization-schema"

export class XyoMockPublicKey implements IXyoPublicKey {
  public schemaObjectId = schema.stubPublicKey.id

  constructor(private readonly publicKeyHexString: string) {}

  public getRawPublicKey(): Buffer {
    return Buffer.from(this.publicKeyHexString, 'hex')
  }

  public serialize(): Buffer {
    return this.getRawPublicKey()
  }
}
