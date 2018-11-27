/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 26th November 2018 3:10:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base-payload.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 3:16:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoPayload } from "./@types"
import { IXyoSerializableObject, untypedArrayOf } from '@xyo-network/serialization'

export abstract class XyoBasePayload extends XyoBase implements IXyoPayload {

  public static schemaObjectId = 0x03

  public abstract signedPayload: IXyoSerializableObject[]
  public abstract unsignedPayload: IXyoSerializableObject[]

  public get schemaObjectId (): number {
    return XyoBasePayload.schemaObjectId
  }

  public serialize(): Buffer | IXyoSerializableObject[] {
    return [
      untypedArrayOf(this.signedPayload),
      untypedArrayOf(this.unsignedPayload)
    ]
  }
}
