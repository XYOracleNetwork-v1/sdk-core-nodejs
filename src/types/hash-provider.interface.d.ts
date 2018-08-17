import { IXYOBase } from "xyo-base.interface";

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 9:25:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: hash-provider.interface.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 17th August 2018 9:40:16 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IHashProvider extends IXYOBase {
  hash(data: Uint8Array): any;
  verifyHash(data: Uint8Array, hash: Uint8Array): boolean;
}