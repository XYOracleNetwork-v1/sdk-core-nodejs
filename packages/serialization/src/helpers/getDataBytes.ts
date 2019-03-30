/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:19:31 pm
 * @Email:  developer@xyfindables.com
 * @Filename: getDataBytes.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from "@xyo-network/errors"
import { IXyoObjectPartialSchema } from "../@types"
import BN from 'bn.js'

export function getDataBytes(src: Buffer, partialSchema: IXyoObjectPartialSchema, srcIncludesHeader: boolean) {
  const headerOffset = srcIncludesHeader ? 2 : 0
  if (partialSchema.sizeIdentifierSize === null) {
    throw new XyoError(`sizeIdentifierSize is null`)
  }

  const numberOfBytesIncludingSize = getNumberOfBytesIncludingSize(src, headerOffset, partialSchema.sizeIdentifierSize)
  const dataStart = partialSchema.sizeIdentifierSize + headerOffset
  const dataEnd = (numberOfBytesIncludingSize - partialSchema.sizeIdentifierSize) + dataStart

  if (src.length < dataEnd) {
    throw new XyoError(`Could not get data bytes, wrong buffer size`)
  }

  return src.slice(dataStart, dataEnd)
}

function getNumberOfBytesIncludingSize(src: Buffer, offset: number, sizeIdentifierSize: number) {
  switch (sizeIdentifierSize) {
    case 1:
      if (src.length < (offset + 1)) {
        throw new XyoError(`sizeIdentifierSize could not be read`)
      }
      return src.readUInt8(offset)
    case 2:
      if (src.length < (offset + 2)) {
        throw new XyoError(`sizeIdentifierSize could not be read`)
      }
      return src.readUInt16BE(offset)
    case 4:
      if (src.length < (offset + 4)) {
        throw new XyoError(`sizeIdentifierSize could not be read`)
      }
      return src.readUInt32BE(offset)
    case 8:
      if (src.length < (offset + 8)) {
        throw new XyoError(`sizeIdentifierSize could not be read`)
      }
      return new BN(src.slice(offset, offset + 8).toString('hex'), 16).toNumber()
    default:
      throw new XyoError(`sizeIdentifierSize could not be resolved`)
  }
}
