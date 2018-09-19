/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 2:23:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain-types.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 2:55:38 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoHash } from '../components/hashing/xyo-hash';

export interface XyoOriginBlockRepository {
  removeOriginBlock(hash: Buffer): Promise<void>;
  containsOriginBlock(hash: Buffer): Promise<boolean>;
  getAllOriginBlockHashes(): Promise<Buffer[]>;
  addOriginBlock(hash: XyoHash, originBlock: XyoBoundWitness): Promise<void>;
}
