/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 3:43:38 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 2:16:49 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSerializableObject } from './@types'
import { IXyoObjectSchema, IIterableType, getNumberOfBytesRequiredForSizeBuffer, getSizeHeader, getHeader } from '@xyo-network/object-schema'
import { XyoError, XyoErrors } from '@xyo-network/errors'

export {
  IXyoSerializable,
  IXyoSerializationProvider,
  IXyoSerializationService,
  BufferOrString,
  SerializationType,
  IXyoTypeSerializer,
  IXyoSerializableObject
} from './@types'

export { XyoSerializationService } from './xyo-serialization-service'

export function resolveSerializablesToBuffer(
  schemaId: number,
  schema: IXyoObjectSchema,
  serializables: IXyoSerializableObject[]): Buffer {

  const partialSchema = findSchemaById(schemaId, schema)
  if (partialSchema.iterableType === 'not-iterable') {
    throw new XyoError(`Incorrect schema iterable type for ${schemaId}`, XyoErrors.CRITICAL)
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
    throw new XyoError(`Serializers do not conform`, XyoErrors.CRITICAL)
  }

  let arraySerializationType: IIterableType

  if (numberOfSerializerTypes > 1) {
    if (partialSchema.iterableType === 'iterable-typed') {
      throw new XyoError(`Incorrect schema iterable type for ${schemaId}`, XyoErrors.CRITICAL)
    }
    arraySerializationType = 'iterable-untyped'
  } else { // numberOfSerializerTypes === 1
    arraySerializationType = partialSchema.iterableType || 'iterable-typed'
  }

  let highestByteAmount = 0
  const components = serializables.reduce((bufferCollection, serializable) => {
    const result = serializable.serialize()
    if (result instanceof Buffer) {
      highestByteAmount = Math.max(result.length, highestByteAmount)
      bufferCollection.push({
        id: serializable.schemaObjectId,
        buffer: result
      })
      return bufferCollection
    }

    const resolveBuffer = resolveSerializablesToBuffer(serializable.schemaObjectId, schema, result)
    highestByteAmount = Math.max(resolveBuffer.length, highestByteAmount)
    bufferCollection.push({
      id: serializable.schemaObjectId,
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
    const innerSchema = findSchemaById(components[0].id, schema)
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
    const innerSchema = findSchemaById(components[0].id, schema)
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

export function findSchemaById(schemaId: number, objectSchema: IXyoObjectSchema) {
  const key = Object.keys(objectSchema).find((schemaKey) => {
    return objectSchema[schemaKey].id === schemaId
  })

  if (!key) {
    throw new XyoError(`Could not find a serializer with id ${schemaId}`, XyoErrors.CRITICAL)
  }

  return objectSchema[key]
}

interface IBufferIdPair {
  id: number
  buffer: Buffer
}
