/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th September 2018 5:08:33 pm
 * @Email:  developer@xyfindables.com
 * @Filename: buffer-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 10th September 2018 5:12:28 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * Poor mans Buffer hashing function
 * @param buffer
 */

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
