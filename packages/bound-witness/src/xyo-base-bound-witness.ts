/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 26th November 2018 2:52:10 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base-bound-witness.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 27th November 2018 4:21:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoBoundWitness, IXyoPayload } from "./@types"
import { IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { IXyoSerializableObject, typedArrayOf, untypedArrayOf } from '@xyo-network/serialization'

export abstract class XyoBaseBoundWitness extends XyoBase implements IXyoBoundWitness {

  public static schemaObjectId = 0x00

  public abstract publicKeys: IXyoPublicKey[][]
  public abstract signatures: IXyoSignature[][]
  public abstract payloads: IXyoPayload[]

  public serialize(): Buffer | IXyoSerializableObject[] {
    return [
      typedArrayOf(this.publicKeys.map(publicKeyCollection => untypedArrayOf(publicKeyCollection))),
      typedArrayOf(this.payloads),
      typedArrayOf(this.signatures.map(signatureCollection => untypedArrayOf(signatureCollection))),
    ]
  }

  public get schemaObjectId (): number {
    return XyoBaseBoundWitness.schemaObjectId
  }
}
