/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:51:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serialization-service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 9:23:02 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { BufferOrString, IXyoSerializationService, IXyoSerializableObject, IXyoTypeSerializer, SerializationType, IXyoDeserializer, IXyoObjectSchema } from "./@types"

import { XyoBase } from '@xyo-network/base'
import { resolveSerializablesToBuffer } from "./helpers/resolveSerializablesToBuffer"
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { serialize } from './helpers/serialize'
import { findSchemaById } from './helpers/findSchemaById'
import { readHeader } from './helpers/readHeader'

export class XyoSerializationService extends XyoBase implements IXyoSerializationService {

  constructor (
    private readonly schema: IXyoObjectSchema,
    private readonly recipes: { [s: string]: IXyoDeserializer<IXyoSerializableObject>}) {
    super()
  }

  public serialize(
    serializable: IXyoSerializableObject,
    serializationType?: "buffer" | "hex" | undefined
  ): BufferOrString {
    const result = serializable.serialize()
    const buf = result instanceof Buffer ?
      result :
      resolveSerializablesToBuffer(serializable.schemaObjectId, this.schema, result)

    const b = serialize(buf, findSchemaById(serializable.schemaObjectId, this.schema))
    if (serializationType === 'hex') {
      return b.toString('hex')
    }

    return b
  }

  public deserialize<T extends IXyoSerializableObject>(deserializable: BufferOrString): T {
    const src = deserializable instanceof Buffer ? deserializable : Buffer.from(deserializable, 'hex')
    const srcSchema = readHeader(src)
    const recipe = this.recipes[srcSchema.id]
    if (!recipe) {
      throw new XyoError(`Could not find a recipe for id ${srcSchema.id}`, XyoErrors.CRITICAL)
    }

    return recipe.deserialize(src, this) as T
  }

  public getInstanceOfTypeSerializer<T extends IXyoSerializableObject>(): IXyoTypeSerializer<T> {
    const s: IXyoTypeSerializer<T > = {
      serialize: (object: T, serializationType?: SerializationType) => {
        return this.serialize(object, serializationType)
      },
      deserialize: (deserializable: BufferOrString) => {
        return this.deserialize<T>(deserializable)
      }
    }

    return s
  }
}
