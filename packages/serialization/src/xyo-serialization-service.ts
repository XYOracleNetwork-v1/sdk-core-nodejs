/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:51:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serialization-service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 27th November 2018 9:44:54 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { BufferOrString, IXyoSerializationService, IXyoSerializableObject, IXyoTypeSerializer, SerializationType } from "./@types"

import { XyoBase } from '@xyo-network/base'
import { resolveSerializablesToBuffer } from "."
import { schema, serialize, findSchemaById } from '@xyo-network/object-schema'

export class XyoSerializationService extends XyoBase implements IXyoSerializationService {

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
    throw new Error("Method not implemented.")
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
