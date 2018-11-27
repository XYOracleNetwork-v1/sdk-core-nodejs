/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 3:43:38 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 5:06:07 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSerializableObject } from './@types'
import { IXyoObjectSchema, IIterableType, getNumberOfBytesRequiredForSizeBuffer, getSizeHeader, getHeader, schema, findSchemaById } from '@xyo-network/object-schema'
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
  objectSchema: IXyoObjectSchema,
  serializables: IXyoSerializableObject[]): Buffer {

  const partialSchema = findSchemaById(schemaId, objectSchema)
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

    const resolveBuffer = resolveSerializablesToBuffer(serializable.schemaObjectId, objectSchema, result)
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
    const innerSchema = findSchemaById(components[0].id, objectSchema)
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
    const innerSchema = findSchemaById(components[0].id, objectSchema)
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

export function typedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject {
  return {
    schemaObjectId: schema.typedSet.id,
    serialize: () => {
      return tCollection
    }
  }
}

export function untypedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject {
  return {
    schemaObjectId: schema.untypedSet.id,
    serialize: () => {
      return tCollection
    }
  }
}

export function fromArray<T extends IXyoSerializableObject>(s: IXyoSerializableObject): T[] {
  return s.serialize() as T[]
}

export function unSignedNumberToBuffer(num: number): Buffer {
  let buf: Buffer

  if (num <= Math.pow(2, 8) - 1) {
    buf = Buffer.alloc(1)
    buf.writeUInt8(num, 0)
  } else if (num <= Math.pow(2, 16) - 1) {
    buf = Buffer.alloc(2)
    buf.writeUInt16BE(num, 0)
  } else if (num <= Math.pow(2, 32) - 1) {
    buf = Buffer.alloc(4)
    buf.writeUInt32BE(num, 0)
  } else if (num > Math.pow(2, 32)) {
    throw new XyoError('This is not yet supported', XyoErrors.CRITICAL)
  } else {
    throw new XyoError('This should never happen', XyoErrors.CRITICAL)
  }

  return buf
}

export function signedNumberToBuffer(num: number): Buffer {
  let buf: Buffer

  if (num <= Math.pow(2, 7) - 1) {
    buf = Buffer.alloc(1)
    buf.writeInt8(num, 0)
  } else if (num <= Math.pow(2, 15) - 1) {
    buf = Buffer.alloc(2)
    buf.writeInt16BE(num, 0)
  } else if (num <= Math.pow(2, 31) - 1) {
    buf = Buffer.alloc(4)
    buf.writeInt32BE(num, 0)
  } else if (num > Math.pow(2, 31)) {
    throw new XyoError('This is not yet supported', XyoErrors.CRITICAL)
  } else {
    throw new XyoError('This should never happen', XyoErrors.CRITICAL)
  }

  return buf
}

interface IBufferIdPair {
  id: number
  buffer: Buffer
}
