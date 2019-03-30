/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 4:58:38 pm
 * @Email:  developer@xyfindables.com
 * @Filename: getHeader.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoObjectPartialSchema } from "../@types"
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { getSizeHeader } from "./getSizeHeader"
import { getLeastNumberOfBytesToEncodeSize } from "./getLeastNumberOfBytesToEncodeSize"

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
        throw new XyoError(`This should never happen exception`)
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
