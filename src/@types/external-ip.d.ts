/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 15th October 2018 10:36:45 am
 * @Email:  developer@xyfindables.com
 * @Filename: external-ip.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 15th October 2018 10:49:57 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

declare module 'external-ip' {
  export default function(): (cb: (err: Error | undefined, ip: string) => void) => void
}