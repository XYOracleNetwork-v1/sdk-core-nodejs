/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 26th February 2019 12:21:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: eth-lib.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 26th February 2019 12:24:17 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

declare module 'eth-lib' {
  const hash: {
    keccak256: (str: string) => string,
    keccak512: (str: string) => string,
    keccak256s: (str: string) => string,
    keccak512s: (str: string) => string,
  }

  export {
    hash
  }
}
