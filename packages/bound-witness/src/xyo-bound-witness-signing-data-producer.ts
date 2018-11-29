/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 27th November 2018 9:11:31 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-signing-data-producer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 1:13:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitnessSigningDataProducer, IXyoBoundWitness } from "./@types"
import { typedArrayOf, untypedArrayOf, resolveSerializablesToBuffer, IXyoSerializableObject, IXyoObjectSchema } from '@xyo-network/serialization'
import { XyoError, XyoErrors } from "@xyo-network/errors"

export class XyoBoundWitnessSigningDataProducer implements IXyoBoundWitnessSigningDataProducer {

  constructor(private readonly objectSchema: IXyoObjectSchema) {}

  public getSigningData(boundWitness: IXyoBoundWitness): Buffer {
    const collection: Buffer[] = []
    const serializedPublicKeys = this.serializePublicKeys(boundWitness)
    collection.push(serializedPublicKeys)

    for (const payload of boundWitness.payloads) {
      if (!payload) {
        throw new XyoError(`Payload can't be null`, XyoErrors.CRITICAL)
      }
      const payloadData = payload.signedPayload
      collection.push(this.serializeSignedPayload(payloadData))
    }

    return Buffer.concat(collection)

  }

  private serializePublicKeys(boundWitness: IXyoBoundWitness): Buffer {
    const serializableObject = typedArrayOf(
      boundWitness.publicKeys.map(publicKeyCollection => untypedArrayOf(publicKeyCollection))
    )
    const result = serializableObject.serialize()
    if (result instanceof Buffer) {
      return result
    }

    return resolveSerializablesToBuffer(serializableObject.schemaObjectId, this.objectSchema, result)
  }

  private serializeSignedPayload(serializableObjects: IXyoSerializableObject[]): Buffer {
    const serializableObject = untypedArrayOf(serializableObjects)
    const result = serializableObject.serialize()
    if (result instanceof Buffer) {
      return result
    }

    return resolveSerializablesToBuffer(serializableObject.schemaObjectId, this.objectSchema, result)
  }
}
