/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 4:57:09 pm
 * @Email:  developer@xyfindables.com
 * @Filename: getNumberOfBytesRequiredForSizeBuffer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from '@xyo-network/errors'
import { getLeastNumberOfBytesToEncodeSize } from './getLeastNumberOfBytesToEncodeSize'

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
        throw new XyoError(`This should never happen exception`)
    }
  })()

  return bytesRequired as 1 | 2 | 4 | 8
}
