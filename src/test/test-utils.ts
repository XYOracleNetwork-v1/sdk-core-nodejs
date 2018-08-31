/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 1:36:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: test-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 1:40:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRssi } from '../components/heuristics/numbers/signed/xyo-rssi';
import { XyoMd5 } from '../components/hashing/xyo-md5';
import { XyoSha1 } from '../components/hashing/xyo-sha1';
import { XyoSha224 } from '../components/hashing/xyo-sha224';
import { XyoSha256 } from '../components/hashing/xyo-sha256';
import { XyoSha384 } from '../components/hashing/xyo-sha384';
import { XyoSha512 } from '../components/hashing/xyo-sha512';

export function loadAllTypes() {
  XyoRssi.creator.enable();
  XyoMd5.creator.enable();
  XyoSha1.creator.enable();
  XyoSha224.creator.enable();
  XyoSha256.creator.enable();
  XyoSha384.creator.enable();
  XyoSha512.creator.enable();
}
