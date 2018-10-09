/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 3:44:04 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-types.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 14th September 2018 11:37:12 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * The support NumberTypes in the Xyo Major/Minor encoding system
 */

export enum XyoNumberType {
  BYTE = 1,   // 8 bits    (1 byte)
  SHORT = 2,  // 16 bits   (2 bytes)
  INT = 4,    // 32 bits   (4 bytes)
  LONG = 8,   // 64 bits   (8 bytes)
  FLOAT = 4  // 32 bit    (1 byte)  floating point
}
