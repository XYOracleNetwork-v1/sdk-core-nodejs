/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 9:25:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: hash-provider.interface.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 10:36:39 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBase } from './xyo-base';
import { XyoResult } from '../components/xyo-result';

export interface IHashProvider extends IXyoBase {
  hash(data: Buffer): Promise<Buffer>;
  verifyHash(data: Buffer, hash: Buffer): Promise<XyoResult<boolean>>;
}
