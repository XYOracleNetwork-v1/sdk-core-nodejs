/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 9:25:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: hash-provider.interface.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:54:50 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBase } from './xyo-base';

export interface IHashProvider extends IXyoBase {
  hash(data: Buffer): Promise<Buffer>;
  verifyHash(data: Buffer, hash: Buffer): Promise<boolean>;
}
