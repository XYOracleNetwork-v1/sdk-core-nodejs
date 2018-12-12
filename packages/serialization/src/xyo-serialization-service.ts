/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:51:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serialization-service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 11:03:10 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { BufferOrString, IXyoSerializationService, IXyoSerializableObject, IXyoDeserializer, IXyoObjectSchema, IParseResult, IOnTheFlyGetDataOptions } from "./@types"

import { XyoBase } from '@xyo-network/base'
import { resolveSerializablesToBuffer } from "./helpers/resolveSerializablesToBuffer"
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { serialize } from './helpers/serialize'
import { findSchemaById } from './helpers/findSchemaById'
import { readHeader } from './helpers/readHeader'
import { parse } from "./helpers/parse"
import { XyoTreeIterator } from "./helpers/tree-iterator"
import { XyoOnTheFlySerializable } from "./helpers/on-the-fly-serializable"

export class XyoSerializationService extends XyoBase implements IXyoSerializationService {

  private recipes: { [s: string]: IXyoDeserializer<IXyoSerializableObject>} = {}

  constructor (
    public readonly schema: IXyoObjectSchema) {
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

  public addDeserializer(deserializer: IXyoDeserializer<IXyoSerializableObject>) {
    if (Boolean(this.recipes[deserializer.schemaObjectId])) {
      throw new XyoError(`There already exist a deserializer for ${deserializer.schemaObjectId}`, XyoErrors.CRITICAL)
    }

    this.recipes[deserializer.schemaObjectId] = deserializer
  }

  public deserialize(deserializable: BufferOrString): XyoTreeIterator {
    const src = deserializable instanceof Buffer ? deserializable : Buffer.from(deserializable, 'hex')
    const parseResult = parse(src, this.schema)
    return new XyoTreeIterator(this.schema, parseResult)
  }

  public hydrate<T extends IXyoSerializableObject>(deserializable: IParseResult): T {
    const src = Buffer.concat([
      deserializable.headerBytes,
      deserializable.dataBytes
    ])

    const srcSchema = readHeader(src)
    const recipe = this.recipes[srcSchema.id]
    if (!recipe) {
      throw new XyoError(`No recipe exists for ${srcSchema.id}`, XyoErrors.CRITICAL)
    }

    const deserializationResult = recipe.deserialize(src, this) as T
    deserializationResult.srcBuffer = src
    return deserializationResult
  }

  public arrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject {
    const typeAccumulator: {[s: string]: number} = {}

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < tCollection.length; i++) {
      typeAccumulator[tCollection[i].schemaObjectId] = (typeAccumulator[tCollection[i].schemaObjectId] || 0) + 1
      if (Object.keys(typeAccumulator).length > 1) {
        return this.untypedArrayOf(tCollection)
      }
    }

    return this.typedArrayOf(tCollection)
  }

  public typedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject {
    const options: IOnTheFlyGetDataOptions = {}
    if (tCollection.length === 0) {
      options.buffer = Buffer.alloc(0)
    } else  {
      options.array = tCollection
    }
    return new XyoOnTheFlySerializable(this.schema, this.schema.typedSet.id, options)
  }

  public untypedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject {
    const options: IOnTheFlyGetDataOptions = {}
    if (tCollection.length === 0) {
      options.buffer = Buffer.alloc(0)
    } else  {
      options.array = tCollection
    }
    return new XyoOnTheFlySerializable(this.schema, this.schema.untypedSet.id, options)
  }

  public findFirstElement<T extends IXyoSerializableObject>(
    collection: IXyoSerializableObject[],
    schemaObjectId: number
  ): T | undefined {
    return collection.find(item => item.schemaObjectId === schemaObjectId) as T | undefined
  }
}
