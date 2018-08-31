/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 3:44:04 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-types.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 3:04:42 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * The support NumberTypes in the Xyo Major/Minor encoding system
 */

export enum XyoNumberType {
  BYTE,   // 8 bits    (1 byte)
  SHORT,  // 16 bits   (2 bytes)
  INT,    // 32 bits   (4 bytes)
  LONG,   // 64 bits   (8 bytes)
  FLOAT   // 32 bit    (1 byte)  floating point
}
