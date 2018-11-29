/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:00:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: getLeastNumberOfBytesToEncodeSize.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 5:00:37 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

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
