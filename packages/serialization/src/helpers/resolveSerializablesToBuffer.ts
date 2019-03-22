/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:45:13 pm
 * @Email:  developer@xyfindables.com
 * @Filename: resolveSerializablesToBuffer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoObjectSchema, IXyoSerializableObject, IIterableType, IXyoObjectPartialSchema } from "../@types"
import { XyoError, XyoErrors } from "@xyo-network/errors"
import { getHeader } from "./getHeader"
import { getNumberOfBytesRequiredForSizeBuffer } from "./getNumberOfBytesRequiredForSizeBuffer"
import { getSizeHeader } from "./getSizeHeader"
import { readHeader } from "./readHeader"

export function resolveSerializablesToBuffer(
  schema: IXyoObjectPartialSchema,
  objectSchema: IXyoObjectSchema,
  serializables: IXyoSerializableObject[]): Buffer {

  if (serializables.length === 0) {
    return Buffer.alloc(0)
  }

  if (schema.iterableType === 'not-iterable') {
    throw new XyoError(`Incorrect schema iterable type for ${schema.id}`, XyoErrors.CRITICAL)
  }

  const serializablesById: {[s: string]: number} = {}

  serializables.reduce((grouper, serializable) => {
    let group = grouper[serializable.schemaObjectId] || 0
    group += 1
    grouper[serializable.schemaObjectId] = group
    return grouper
  }, serializablesById)

  const numberOfSerializerTypes = Object.keys(serializablesById).length
  if (numberOfSerializerTypes === 0) {
    throw new XyoError(`Serializers do not conform`)
  }

  let arraySerializationType: IIterableType

  if (numberOfSerializerTypes > 1) {
    if (schema.iterableType === 'iterable-typed') {
      throw new XyoError(`Incorrect schema iterable type for ${schema.id}`, XyoErrors.CRITICAL)
    }

    arraySerializationType = 'iterable-untyped'
  } else { // numberOfSerializerTypes === 1
    arraySerializationType = schema.iterableType || 'iterable-typed'
  }

  let highestByteAmount = 0
  const components = serializables.reduce((bufferCollection, serializable) => {
    const result = serializable.getData()

    if (result instanceof Buffer) {
      highestByteAmount = Math.max(result.length, highestByteAmount)

      bufferCollection.push({
        schema: serializable.realSchema(),
        buffer: result
      })
      return bufferCollection
    }

    if (!Array.isArray(result)) {
      const resultBuffer = result.serialize()
      highestByteAmount = Math.max(resultBuffer.length, highestByteAmount)
      bufferCollection.push({
        schema: serializable.realSchema(),
        buffer: resultBuffer
      })
      return bufferCollection
    }

    const schemaOfSub = serializable.realSchema()

    const resolveBuffer = resolveSerializablesToBuffer(schemaOfSub, objectSchema, result)
    highestByteAmount = Math.max(resolveBuffer.length, highestByteAmount)
    bufferCollection.push({
      schema: serializable.realSchema(),
      buffer: resolveBuffer
    })

    return bufferCollection
  }, [] as IBufferIdPair[])

  if (arraySerializationType === 'iterable-typed') {
    const bufferSize = getNumberOfBytesRequiredForSizeBuffer(highestByteAmount)
    const componentsWithSize = components.reduce((collection, component) => {
      const sizeBuffer = getSizeHeader(component.buffer.length, bufferSize)
      collection.push(sizeBuffer)
      collection.push(component.buffer)
      return collection
    }, [] as Buffer[])
    const innerSchema = components[0].schema
    return Buffer.concat([
      getHeader(
        highestByteAmount,
        {
          id: innerSchema.id,
          sizeIdentifierSize: bufferSize,
          iterableType: innerSchema.iterableType
        },
        true
      ),
      ...componentsWithSize
    ])
  }

  // 'iterable-untyped'
  const componentsWithHeaders = components.reduce((collection, component) => {
    const innerSchema = component.schema
    const componentHeader = getHeader(
      component.buffer.length,
      {
        id: innerSchema.id,
        sizeIdentifierSize: innerSchema.sizeIdentifierSize,
        iterableType: innerSchema.iterableType
      }
    )
    collection.push(componentHeader)
    collection.push(component.buffer)
    return collection
  }, [] as Buffer[])

  return Buffer.concat(componentsWithHeaders)
}

interface IBufferIdPair {
  schema: IXyoObjectPartialSchema
  buffer: Buffer
}
