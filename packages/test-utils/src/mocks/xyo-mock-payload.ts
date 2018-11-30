/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:38:07 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-payload.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 4:38:57 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBasePayload } from "@xyo-network/bound-witness"
import { IXyoSerializableObject } from "@xyo-network/serialization"

export class XyoMockPayload extends XyoBasePayload {

  constructor (
    public readonly signedPayload: IXyoSerializableObject[],
    public readonly unsignedPayload: IXyoSerializableObject[]
  ) {
    super()
  }
}
