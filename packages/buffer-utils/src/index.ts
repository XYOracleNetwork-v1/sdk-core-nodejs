/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 10:04:37 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 10:06:02 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from "@xyo-network/errors"

/** Returns a pseudo-hash based off the contents of a buffer */
export function getBufferHash(buffer: Buffer): number {
  if (buffer.length === 0) {
    return 0
  }

  let hash = buffer.length

  buffer.forEach((byte: number, index: number) => {
    hash += index
    hash += byte
    return hash * 31 * (index + byte)
  })

  return hash
}

/** A helper function to write a number to a buffer that supports multiple sizes and signings */
export function writeNumberToBuffer(
  numberToWrite: number,
  bytes: number,
  isSigned: boolean,
  buffer?: Buffer,
  offset?: number
) {
  const buf = buffer || Buffer.alloc(bytes)
  const bufOffset = offset || 0

  if (isSigned) {
    switch (bytes) {
      case 1:
        buf.writeInt8(numberToWrite, bufOffset)
        return buf
      case 2:
        buf.writeInt16BE(numberToWrite, bufOffset)
        return buf
      case 4:
        buf.writeInt32BE(numberToWrite, bufOffset)
        return buf
      default:
        throw new XyoError(`Could not write number to buffer`, XyoErrors.CRITICAL)
    }
  }

  switch (bytes) {
    case 1:
      buf.writeUInt8(numberToWrite, bufOffset)
      return buf
    case 2:
      buf.writeUInt16BE(numberToWrite, bufOffset)
      return buf
    case 4:
      buf.writeUInt32BE(numberToWrite, bufOffset)
      return buf
    default:
      throw new XyoError(`Could not write number to buffer`, XyoErrors.CRITICAL)
  }
}

/** A helper function to read a number from a buffer based off of sign by */
export function readNumberFromBuffer(buffer: Buffer, bytes: number, isSigned: boolean, offset?: number) {
  const bufOffset = offset || 0

  if (isSigned) {
    switch (bytes) {
      case 1:
        return buffer.readInt8(bufOffset)
      case 2:
        return buffer.readInt16BE(bufOffset)
      case 4:
        return buffer.readInt32BE(bufOffset)
      default:
        throw new XyoError(`Could not read number from buffer`, XyoErrors.CRITICAL)
    }
  }

  switch (bytes) {
    case 1:
      return buffer.readUInt8(bufOffset)
    case 2:
      return buffer.readUInt16BE(bufOffset)
    case 4:
      return buffer.readUInt32BE(bufOffset)
    default:
      throw new XyoError(`Could not read number from buffer`, XyoErrors.CRITICAL)
  }
}

export function writePointTo32ByteBuffer(point: Buffer) {
  if (point.length === 32) {
    return point
  }
  const dest = Buffer.alloc(32)
  const offset = dest.length - point.length
  let index = 0

  while (index < point.length) {
    dest[offset + index] = point[index]
    index += 1
  }

  return dest
}
