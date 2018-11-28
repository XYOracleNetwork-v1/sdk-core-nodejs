/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:51:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serialization-service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 27th November 2018 4:16:42 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { BufferOrString, IXyoSerializationService, IXyoSerializableObject, IXyoTypeSerializer, SerializationType, IXyoDeserializer } from "./@types"

import { XyoBase } from '@xyo-network/base'
import { resolveSerializablesToBuffer } from "."
import { schema, serialize, findSchemaById, readHeader, getDataBytes } from '@xyo-network/object-schema'
import { XyoError, XyoErrors } from '@xyo-network/errors'

export class XyoSerializationService extends XyoBase implements IXyoSerializationService {

  constructor (private readonly recipes: { [s: string]: IXyoDeserializer<IXyoSerializableObject>}) {
    super()
  }

  public serialize(
    serializable: IXyoSerializableObject,
    serializationType?: "buffer" | "hex" | undefined
  ): BufferOrString {
    const result = serializable.serialize()
    const buf = result instanceof Buffer ?
      result :
      resolveSerializablesToBuffer(serializable.schemaObjectId, schema, result)

    const b = serialize(buf, findSchemaById(serializable.schemaObjectId, schema))
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

    const dataBytes = getDataBytes(src, srcSchema)
    return recipe.deserialize(dataBytes) as T
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
