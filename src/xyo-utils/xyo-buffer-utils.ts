/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th September 2018 5:08:33 pm
 * @Email:  developer@xyfindables.com
 * @Filename: buffer-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 26th September 2018 4:22:28 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * Poor mans Buffer hashing function
 * @param buffer
 */

import { XyoError } from "../xyo-core-components/xyo-error";

export function getBufferHash(buffer: Buffer): number {
  if (buffer.length === 0) {
    return 0;
  }

  let hash = buffer.length;

  buffer.forEach((byte: number, index: number) => {
    hash += index;
    hash += byte;
    return hash * 31 * (index + byte);
  });

  return hash;
}

export function writeNumberToBuffer(
  numberToWrite: number,
  bytes: number,
  isSigned: boolean,
  buffer?: Buffer,
  offset?: number
) {
  const buf = buffer || Buffer.alloc(bytes);
  const bufOffset = offset || 0;

  if (isSigned) {
    switch (bytes) {
      case 1:
        buf.writeInt8(numberToWrite, bufOffset);
        return buf;
      case 2:
        buf.writeInt16BE(numberToWrite, bufOffset);
        return buf;
      case 4:
        buf.writeInt32BE(numberToWrite, bufOffset);
        return buf;
      default:
        throw new XyoError(`Could not write number to buffer`, XyoError.errorType.ERR_CRITICAL);
    }
  }

  switch (bytes) {
    case 1:
      buf.writeUInt8(numberToWrite, bufOffset);
      return buf;
    case 2:
      buf.writeUInt16BE(numberToWrite, bufOffset);
      return buf;
    case 4:
      buf.writeUInt32BE(numberToWrite, bufOffset);
      return buf;
    default:
      throw new XyoError(`Could not write number to buffer`, XyoError.errorType.ERR_CRITICAL);
  }
}

export function readNumberFromBuffer(buffer: Buffer, bytes: number, isSigned: boolean, offset?: number) {
  const bufOffset = offset || 0;

  if (isSigned) {
    switch (bytes) {
      case 1:
        return buffer.readInt8(bufOffset);
      case 2:
        return buffer.readInt16BE(bufOffset);
      case 4:
        return buffer.readInt32BE(bufOffset);
      default:
        throw new XyoError(`Could not read number from buffer`, XyoError.errorType.ERR_CRITICAL);
    }
  }

  switch (bytes) {
    case 1:
      return buffer.readUInt8(bufOffset);
    case 2:
      return buffer.readUInt16BE(bufOffset);
    case 4:
      return buffer.readUInt32BE(bufOffset);
    default:
      throw new XyoError(`Could not read number from buffer`, XyoError.errorType.ERR_CRITICAL);
  }
}
