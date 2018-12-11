/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 3rd December 2018 11:46:08 am
 * @Email:  developer@xyfindables.com
 * @Filename: external-ip.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 3rd December 2018 11:46:44 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

declare module 'external-ip' {
  export default function(): (cb: (err: Error | undefined, ip: string) => void) => void
}