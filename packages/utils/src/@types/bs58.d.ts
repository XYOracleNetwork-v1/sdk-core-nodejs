/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 25th February 2019 12:46:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: bs58.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 25th February 2019 12:49:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

declare module 'bs58' {
  function encode(b: Buffer): string
  function decode(s: string): Buffer

  export {
    encode,
    decode
  }
}