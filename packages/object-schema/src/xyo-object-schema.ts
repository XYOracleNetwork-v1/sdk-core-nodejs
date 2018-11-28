/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 12:15:52 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object-schema.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 27th November 2018 5:52:47 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from '@xyo-network/errors'
import BN from 'bn.js'

export interface IXyoObjectPartialSchema {

  /**
   * How many bytes necessary to encode size of object
   */
  sizeIdentifierSize: 1 | 2 | 4 | 8 | null

  /**
   * Is the value that is being encoded iterable and if so is it typed
   */
  iterableType: IIterableType | null

  /**
   * What is the id of the schema
   */
  id: number
}

export type IIterableType = 'not-iterable' | 'iterable-typed' | 'iterable-untyped'

export interface IXyoReadable {
  getReadableName(): string
  getReadableValue(): any
  getReadableJSON(): string
}

export interface IXyoObjectSchema {
  [s: string]: IXyoObjectPartialSchema
}

export const schema: IXyoObjectSchema = {
  rssi: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x16
  },
  gps: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x18
  },
  lat: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x19
  },
  lng: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x1a
  },
  time: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x17
  },
  blob: {
    sizeIdentifierSize: null,
    iterableType: 'not-iterable',
    id: 0xff
  },
  typedSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x14
  },
  untypedSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x15
  },
  hashStub: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x0c
  },
  sha256Hash: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x09
  },
  sha3Hash: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x0b
  },
  sha512Hash: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x0a
  },
  ecSecp256k1UncompressedPublicKey: {
    sizeIdentifierSize: 1,
    iterableType: 'iterable-untyped',
    id: 0x0d
  },
  rsaPublicKey: {
    sizeIdentifierSize: 2,
    iterableType: 'not-iterable',
    id: 0x11
  },
  stubPublicKey: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x10
  },
  ecdsaSecp256k1WithSha256Signature: {
    sizeIdentifierSize: 1,
    iterableType: 'iterable-untyped',
    id: 0x12
  },
  rsaWithSha256Signature: {
    sizeIdentifierSize: 2,
    iterableType: 'not-iterable',
    id: 0x13
  },
  stubSignature: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x1b
  },
  boundWitness: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x00
  },
  index: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x04
  },
  keySet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x01
  },
  nextPublicKey: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x06
  },
  originBlockHashSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x07
  },
  originBlockSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x08
  },
  payload: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x03
  },
  previousHash: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x05
  },
  signatureSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x02
  },
}

/**
 * Serializes an arbitrary buffer in accordance with the XYO packing protocol
 *
 * @export
 * @param {Buffer} bytes The bytes to serialize
 * @param {IXyoObjectPartialSchema} scheme The schema used to serialize it with
 * @returns {Buffer} Returns the serialized Buffer
 */
export function serialize(bytes: Buffer, scheme: IXyoObjectPartialSchema): Buffer {
  return Buffer.concat([
    getHeader(bytes.length, scheme),
    bytes
  ])
}

export function getNumberOfBytesRequiredForSizeBuffer(
  byteLength: number,
  sizeIdentifierSize: 1 | 2 | 4 | 8 | null = null
): 1 | 2 | 4 | 8  {
  const { bytesRequired } = (() => {
    switch (sizeIdentifierSize) {
      case 1:
        return { numberToEncode: 0, bytesRequired: 1 }
      case 2:
        return { numberToEncode: 1, bytesRequired: 2 }
      case 4:
        return { numberToEncode: 2, bytesRequired: 4 }
      case 8:
        return { numberToEncode: 3, bytesRequired: 8 }
      case null:
        const numberOfBytesRequired = getLeastNumberOfBytesToEncodeSize(byteLength)
        switch (numberOfBytesRequired) {
          case 1:
            return { numberToEncode: 0, bytesRequired: 1 }
          case 2:
            return { numberToEncode: 1, bytesRequired: 2 }
          case 4:
            return { numberToEncode: 2, bytesRequired: 4 }
          case 8:
            return { numberToEncode: 3, bytesRequired: 8 }
        }
      default:
        throw new XyoError(`This should never happen exception`, XyoErrors.CRITICAL)
    }
  })()

  return bytesRequired as 1 | 2 | 4 | 8
}

export function getSizeHeader(byteLength: number, bytesRequired: number) {
  let sizeBuffer = Buffer.alloc(bytesRequired)

  switch (bytesRequired) {
    case 1:
      sizeBuffer.writeUInt8(byteLength + 1, 0)
      break
    case 2:
      sizeBuffer.writeUInt16BE(byteLength + 2, 0)
      break
    case 4:
      sizeBuffer.writeUInt32BE(byteLength + 4, 0)
      break
    case 8:
      sizeBuffer = new BN(byteLength + 8).toBuffer('be', 8)
      break
    default:
      throw new XyoError(`Could not serialize because size ${bytesRequired}`, XyoErrors.INVALID_PARAMETERS)
  }

  return sizeBuffer
}

/**
 * Builds a dynamic header based on the size of bytes for a schema
 *
 * @export
 * @param {number} byteLength The number of bytes to serialize
 * @param {IXyoObjectPartialSchema} scheme The schema used to serialize it with
 * @returns {Buffer} Returns the header
 */
export function getHeader(byteLength: number, scheme: IXyoObjectPartialSchema, withoutSize: boolean = false): Buffer {
  const { numberToEncode, bytesRequired } = (() => {
    switch (scheme.sizeIdentifierSize) {
      case 1:
        return { numberToEncode: 0, bytesRequired: 1 }
      case 2:
        return { numberToEncode: 1, bytesRequired: 2 }
      case 4:
        return { numberToEncode: 2, bytesRequired: 4 }
      case 8:
        return { numberToEncode: 3, bytesRequired: 8 }
      case null:
        const numberOfBytesRequired = getLeastNumberOfBytesToEncodeSize(byteLength)
        switch (numberOfBytesRequired) {
          case 1:
            return { numberToEncode: 0, bytesRequired: 1 }
          case 2:
            return { numberToEncode: 1, bytesRequired: 2 }
          case 4:
            return { numberToEncode: 2, bytesRequired: 4 }
          case 8:
            return { numberToEncode: 3, bytesRequired: 8 }
        }
      default:
        throw new XyoError(`This should never happen exception`, XyoErrors.CRITICAL)
    }
  })()

  const nibbleTop2Bits = numberToEncode << 2

  const nibbleBottom2Bits = (() => {
    switch (scheme.iterableType) {
      case 'iterable-typed':
        return 3
      case 'iterable-untyped':
        return 2
      case 'not-iterable':
        return 0
      default:
        throw new XyoError(
          `Could not serialize with scheme iterable-type ${scheme.iterableType}`, XyoErrors.INVALID_PARAMETERS
        )
    }
  })()

  const byte0 = Buffer.alloc(1)
  const nibble = (nibbleTop2Bits + nibbleBottom2Bits) << 4
  byte0.writeUInt8(nibble, 0)

  const byte1 = (() => {
    const b1 = Buffer.alloc(1)
    b1.writeUInt8(scheme.id, 0)
    return b1
  })()

  if (withoutSize) {
    return Buffer.concat([
      byte0,
      byte1
    ])
  }

  const sizeBuffer = getSizeHeader(byteLength, bytesRequired)

  return Buffer.concat([
    byte0,
    byte1,
    sizeBuffer
  ])
}

export function getLeastNumberOfBytesToEncodeSize(sizeOfObject: number): 1 | 2 | 4 | 8 {
  if (sizeOfObject < 254) { // (Math.pow(2, 8) - 1)) - 1
    return 1
  }

  if (sizeOfObject < 65533) { // (Math.pow(2, 16) - 1) - 2
    return 2
  }

  if (sizeOfObject < 4294967291) { // (Math.pow(2, 32) - 1) - 4
    return 4
  }

  return 8
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

export function readHeader(header: Buffer): IXyoObjectPartialSchema {
  if (header.length < 2) {
    throw new XyoError(`The minimum size of a header is 2 bytes`, XyoErrors.CREATOR_MAPPING)
  }

  const topByte = header.readUInt8(0)
  const id = header.readUInt8(1)

  const topBit = (topByte & 128) > 0
  const bottomBit = (topByte & 64) > 0
  const isIterable = (topByte & 32) > 0
  const isTyped = (topByte & 16) > 0

  return {
    id,
    sizeIdentifierSize: (() => {
      if (!topBit && !bottomBit) { // 0b00
        return 1
      }

      if (!topBit && bottomBit) { // 0b01
        return 2
      }

      if (topBit && !bottomBit) { // 0b10
        return 4
      }

      if (topBit && bottomBit) { // 0b11
        return 8
      }
      throw new Error(`This should never happen`)
    })(),

    iterableType: (() => {
      if (!isIterable && !isTyped) {
        return 'not-iterable'
      }

      if (!isIterable && isTyped) { // 0b01
        throw new XyoError(`Impossible state for serialization`, XyoErrors.CRITICAL)
      }

      if (isIterable && !isTyped) { // 0b10
        return 'iterable-untyped'
      }

      if (isIterable && isTyped) { // 0b10
        return 'iterable-typed'
      }

      throw new Error(`This should never happen`)
    })()
  }
}

export function sliceItem(
  src: Buffer,
  offset: number,
  partialSchema: IXyoObjectPartialSchema,
) {
  const partialSlice = src.slice(offset)
  const slice = getDataBytes(partialSlice, partialSchema)
  return slice
}

export function getDataBytes(src: Buffer, partialSchema: IXyoObjectPartialSchema) {
  if (partialSchema.sizeIdentifierSize === null) {
    throw new XyoError(`sizeIdentifierSize is null`, XyoErrors.CRITICAL)
  }

  let numberOfBytesIncludingSize: number

  switch (partialSchema.sizeIdentifierSize) {
    case 1:
      if (src.length < 3) {
        throw new XyoError(`sizeIdentifierSize could not be read`, XyoErrors.CRITICAL)
      }
      numberOfBytesIncludingSize = src.readUInt8(2)
      break
    case 2:
      if (src.length < 4) {
        throw new XyoError(`sizeIdentifierSize could not be read`, XyoErrors.CRITICAL)
      }
      numberOfBytesIncludingSize = src.readUInt16BE(2)
      break
    case 4:
      if (src.length < 6) {
        throw new XyoError(`sizeIdentifierSize could not be read`, XyoErrors.CRITICAL)
      }
      numberOfBytesIncludingSize = src.readUInt32BE(2)
      break
    case 8:
      if (src.length < 10) {
        throw new XyoError(`sizeIdentifierSize could not be read`, XyoErrors.CRITICAL)
      }
      numberOfBytesIncludingSize = new BN(src.slice(2, 10).toString('hex'), 16).toNumber()
      break
    default:
      throw new XyoError(`sizeIdentifierSize could not be resolved`, XyoErrors.CRITICAL)
  }

  const expectedBufferSize = 2 + numberOfBytesIncludingSize
  const dataStart = partialSchema.sizeIdentifierSize + 2
  const dataEnd = (numberOfBytesIncludingSize - partialSchema.sizeIdentifierSize) + dataStart

  if (src.length < dataEnd) {
    throw new XyoError(`Could not get data bytes, wrong buffer size`, XyoErrors.CRITICAL)
  }

  return src.slice(dataStart, dataEnd)
}
