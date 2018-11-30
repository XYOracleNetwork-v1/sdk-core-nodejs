/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 4:57:39 pm
 * @Email:  developer@xyfindables.com
 * @Filename: getSizeHeader.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 5:17:42 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from '@xyo-network/errors'
import BN from 'bn.js'

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
