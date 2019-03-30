/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:18:09 pm
 * @Email:  developer@xyfindables.com
 * @Filename: readHeader.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoObjectPartialSchema } from "../@types"
import { XyoError, XyoErrors } from "@xyo-network/errors"

export function readHeader(header: Buffer): IXyoObjectPartialSchema {
  if (header.length < 2) {
    throw new XyoError(`The minimum size of a header is 2 bytes`)
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
        throw new XyoError(`Impossible state for serialization`)
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
