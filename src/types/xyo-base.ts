/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 9:27:28 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:54:46 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IXyoBase {
  getMajor(): number;
  getMinor(): number;
  getCode(): number;
  getCanonicalName(): string;
}
