/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 10:04:37 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from "@xyo-network/errors"
import { BN } from "@xyo-network/utils"

/** A helper function to write a number to a buffer that supports multiple sizes and signings */
export function writeIntegerToBuffer(
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
        throw new XyoError(`Could not write number to buffer`)
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
    case 8:
      const bnBuffer = new BN(numberToWrite).toBuffer('be', 8)
      let i = 0
      while (i < 8) {
        buf[i + bufOffset] = bnBuffer[i]
        i += 1
      }
      return buf
    default:
      throw new XyoError(`Could not write number to buffer`)
  }
}

/** A helper function to read a number from a buffer based off of sign by */
export function readIntegerFromBuffer(buffer: Buffer, bytes: number, isSigned: boolean, offset?: number) {
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
        throw new XyoError(`Could not read number from buffer`)
    }
  }

  switch (bytes) {
    case 1:
      return buffer.readUInt8(bufOffset)
    case 2:
      return buffer.readUInt16BE(bufOffset)
    case 4:
      return buffer.readUInt32BE(bufOffset)
    case 8:
      return new BN(buffer.slice(bufOffset || 0, bufOffset + bytes)).toNumber()
    default:
      throw new XyoError(`Could not read number from buffer`)
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

export function unsignedIntegerToBuffer(num: number): Buffer {
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
    buf = new BN(num).toBuffer('be')
  } else {
    throw new XyoError('This should never happen')
  }

  return buf
}

export function signedIntegerToBuffer(num: number): Buffer {
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
    throw new XyoError('This is not yet supported')
  } else {
    throw new XyoError('This should never happen')
  }

  return buf
}

export function doubleToBuffer(num: number): Buffer {
  const b = Buffer.alloc(8)
  b.writeDoubleBE(num, 0)
  return b
}

export function floatToBuffer(num: number): Buffer {
  const b = Buffer.alloc(4)
  b.writeFloatBE(num, 0)
  return b
}

export function readDoubleFromBuffer(buffer: Buffer, offset: number = 0): number {
  return buffer.readDoubleBE(offset)
}

export function readFloatFromBuffer(buffer: Buffer, offset: number = 0): number {
  return buffer.readFloatBE(offset)
}
