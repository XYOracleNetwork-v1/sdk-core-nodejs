/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 3:43:38 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 3:32:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSerializableObject } from './@types'
import { IXyoObjectSchema, IIterableType, getNumberOfBytesRequiredForSizeBuffer, getSizeHeader, getHeader, schema, findSchemaById, readHeader, sliceItem, serialize } from '@xyo-network/object-schema'
import { XyoError, XyoErrors } from '@xyo-network/errors'

export {
  IXyoSerializable,
  IXyoSerializationProvider,
  IXyoSerializationService,
  BufferOrString,
  SerializationType,
  IXyoTypeSerializer,
  IXyoSerializableObject,
  IXyoDeserializer
} from './@types'

export { XyoSerializationService } from './xyo-serialization-service'

export function resolveSerializablesToBuffer(
  schemaId: number,
  objectSchema: IXyoObjectSchema,
  serializables: IXyoSerializableObject[]): Buffer {

  if (serializables.length === 0) {
    return Buffer.alloc(0)
  }

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
      if (tCollection.length === 0) {
        return Buffer.alloc(0)
      }
      return tCollection
    }
  }
}

export function untypedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject {
  return {
    schemaObjectId: schema.untypedSet.id,
    serialize: () => {
      if (tCollection.length === 0) {
        return Buffer.alloc(0)
      }
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

export interface IParseResult {
  data: Buffer | IParseResult[]
  id: number
  sizeIdentifierSize: 1 | 2 | 4 | 8
  iterableType: 'iterable-typed' | 'iterable-untyped' | 'not-iterable'
}

export function parse(src: Buffer): IParseResult {
  const partialSchema = readHeader(src)
  const data = sliceItem(src, 0, partialSchema, true)

  if (partialSchema.iterableType === 'not-iterable') {
    return {
      data,
      id: partialSchema.id,
      sizeIdentifierSize: partialSchema.sizeIdentifierSize!,
      iterableType: 'not-iterable'
    }
  }

  const items: IParseResult[] = []
  let innerHeader = readHeader(data)
  let innerHeaderBytes = data.slice(0, 2)
  let offset = 2
  let sizeBytes = data.slice(offset, offset + innerHeader.sizeIdentifierSize!)

  while (offset < data.length) {
    // tslint:disable-next-line:prefer-conditional-expression
    if (partialSchema.iterableType === 'iterable-untyped') {
      if (offset !== 2) {
        innerHeaderBytes = data.slice(offset, offset + 2)
        innerHeader = readHeader(innerHeaderBytes)
        offset += 2
      }
    }

    if (offset !== 2) {
      sizeBytes = data.slice(offset, offset + innerHeader.sizeIdentifierSize!)
    }

    let latestResult: Buffer | IParseResult = sliceItem(data, offset, innerHeader, false)

    offset += latestResult.length + innerHeader.sizeIdentifierSize!
    if (innerHeader.iterableType !== 'not-iterable') {
      latestResult = parse(Buffer.concat([innerHeaderBytes, sizeBytes, latestResult]))
      items.push(latestResult)
    } else {
      items.push({
        id: innerHeader.id,
        sizeIdentifierSize: innerHeader.sizeIdentifierSize!,
        iterableType: innerHeader.iterableType!,
        data: latestResult
      })
    }

  }

  return {
    data: items,
    id: partialSchema.id,
    sizeIdentifierSize: partialSchema.sizeIdentifierSize!,
    iterableType: partialSchema.iterableType!
  }
}

export class ParseQuery {
  constructor(private readonly parseResult: IParseResult) {}

  public query(queryIndexes: number[]) {
    const queriedParseResult = queryIndexes.reduce((parseResult, indexToQuery, indexInArray) => {
      if (Array.isArray(parseResult.data)) {
        const childParseResults = parseResult.data as IParseResult[]
        if (childParseResults.length > indexToQuery) {
          return childParseResults[indexToQuery]
        }
        throw new XyoError(`Data can not be queried. Index out of bounds ${indexInArray}`, XyoErrors.CRITICAL)
      }

      throw new XyoError(`Data can not be queried at index ${indexInArray}`, XyoErrors.CRITICAL)
    }, this.parseResult)

    return new ParseQuery(queriedParseResult)
  }

  public mapChildren<T>(callbackfn: (value: ParseQuery, index?: number) => T) {
    if (this.isReadable()) {
      throw new XyoError(`No children to map`, XyoErrors.CRITICAL)
    }

    return (this.parseResult.data as IParseResult[]).map((item, index) => {
      return callbackfn(new ParseQuery(item), index)
    })
  }

  public readData(withHeader: boolean = false): Buffer {
    if (!(this.parseResult.data instanceof Buffer)) {
      throw new XyoError(`Data is not readable`, XyoErrors.CRITICAL)
    }

    if (!withHeader) {
      return this.parseResult.data
    }

    return serialize(this.parseResult.data, {
      sizeIdentifierSize: this.parseResult.sizeIdentifierSize,
      id: this.parseResult.id,
      iterableType: this.parseResult.iterableType
    })
  }

  public isReadable(): boolean {
    return this.parseResult.data instanceof Buffer
  }
}
