/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 3:50:25 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 21st November 2018 5:54:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitness, IXyoPayload } from '@xyo-network/bound-witness'
import { BufferOrString, SerializationType, IXyoTypeSerializer } from '@xyo-network/serialization'
import { IXyoObjectSchema, IXyoObjectPartialSchema, serialize, getHeader } from '@xyo-network/object-schema'
import { IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { XyoBase } from '@xyo-network/base'

export class XyoBoundWitnessSerializer extends XyoBase implements IXyoTypeSerializer<IXyoBoundWitness> {

  constructor (
    private readonly schema: IXyoObjectPartialSchema,
    private readonly publicKeysSerializer: IXyoTypeSerializer<IXyoPublicKey[]>,
    private readonly payloadsSerializer: IXyoTypeSerializer<IXyoPayload>,
    private readonly signaturesSerializer: IXyoTypeSerializer<IXyoSignature[]>,
  ) {
    super()
  }

  public serialize(boundWitness: IXyoBoundWitness, serializationType: SerializationType): BufferOrString {
    const data = this.getData(boundWitness)
    const serializedData = Buffer.concat([
      this.getHeader(data.length),
      data
    ])

    if (serializationType === 'hex') {
      return serializedData.toString('hex')
    }

    return serializedData
  }

  public getHeader(size: number): Buffer {
    return getHeader(size, this.schema)
  }

  public getData(boundWitness: IXyoBoundWitness): Buffer {
    const publicKeyBytes = this.publicKeysSerializer.serializeCollection(boundWitness.publicKeys) as Buffer
    const payloadBytes = this.payloadsSerializer.serializeCollection(boundWitness.payloads) as Buffer
    const signatureBytes = this.signaturesSerializer.serializeCollection(boundWitness.signatures) as Buffer
    return this.createArray([publicKeyBytes, payloadBytes, signatureBytes], false)
  }

  public deserialize(deserializable: BufferOrString): IXyoBoundWitness {
    throw new Error("Method not implemented.")
  }

  private createArray(data: Buffer[], isTyped: boolean, sharedHeader?: Buffer): Buffer {
    if (!isTyped) {
      serialize()
    }
  }
}
