/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 9:25:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: hash-provider.interface.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 2:14:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from '../components/hashing/xyo-hash';

/**
 * The interface for hashing providers in the system
 */

export interface XyoHashProvider {
  createHash(data: Buffer): Promise<XyoHash>;
  verifyHash(data: Buffer, hash: Buffer): Promise<boolean>;
}
