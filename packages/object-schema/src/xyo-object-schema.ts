/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 12:15:52 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object-schema.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 19th November 2018 6:06:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from '@xyo-network/errors'
import BN from 'bn.js'

export interface IXyoObjectSchema {

  /**
   * How many bytes necessary to encode size of object
   */
  sizeIdentifierSize: 1 | 2 | 4 | 8 | null

  /**
   * Is the value that is being encoded iterable and if so is it typed
   */
  iterableType: IIterableType

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

export const schema: { [s: string]: IXyoObjectSchema } = {
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
 * @param {IXyoObjectSchema} scheme The schema used to serialize it with
 * @returns {Buffer} Returns the serialized Buffer
 */
export function serialize(bytes: Buffer, scheme: IXyoObjectSchema): Buffer {
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
        const numberOfBytesRequired = getLeastNumberOfBytesToEncodeSize(bytes.length)
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

  const byte0Top2Bits = numberToEncode << 2

  const byte0Bottom2Bits = (() => {
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
  byte0.writeUInt8(byte0Top2Bits + byte0Bottom2Bits, 0)

  const byte1 = (() => {
    const b1 = Buffer.alloc(1)
    b1.writeUInt8(scheme.id, 0)
    return b1
  })()

  let sizeBuffer = Buffer.alloc(bytesRequired)

  switch (bytesRequired) {
    case 1:
      sizeBuffer.writeUInt8(bytes.length + 1, 0)
      break
    case 2:
      sizeBuffer.writeUInt16BE(bytes.length + 2, 0)
      break
    case 4:
      sizeBuffer.writeUInt32BE(bytes.length + 4, 0)
      break
    case 8:
      sizeBuffer = new BN(bytes.length + 8).toBuffer('be', 8)
      break
    default:
      throw new XyoError(`Could not serialize because size ${bytesRequired}`, XyoErrors.INVALID_PARAMETERS)
  }

  return Buffer.concat([
    byte0,
    byte1,
    sizeBuffer,
    bytes
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
