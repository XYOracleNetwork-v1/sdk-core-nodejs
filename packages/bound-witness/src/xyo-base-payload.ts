/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 26th November 2018 3:10:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base-payload.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 3:28:30 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoPayload } from "./@types"
import { IXyoSerializableObject } from '@xyo-network/serialization'
import { untypedArrayOf } from '@xyo-network/serialization-utils'
import { schema } from '@xyo-network/serialization-schema'
export abstract class XyoBasePayload extends XyoBase implements IXyoPayload {

  public static schemaObjectId = schema.payload.id

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
