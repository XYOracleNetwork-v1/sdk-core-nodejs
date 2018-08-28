/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 1:36:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: test-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 9:58:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRssi } from '../components/heuristics/numbers/signed/xyo-rssi';
import { Md5 } from '../components/hashing/md5';
import { Sha1 } from '../components/hashing/sha1';
import { Sha224 } from '../components/hashing/sha224';
import { Sha256 } from '../components/hashing/sha256';
import { Sha384 } from '../components/hashing/sha384';
import { Sha512 } from '../components/hashing/sha512';
import { XyoStrongArray } from '../components/arrays/xyo-strong-array';
import { XyoWeakArray } from '../components/arrays/xyo-weak-array';

export function loadAllTypes() {
  XyoRssi.enable();
  XyoStrongArray.enable();
  XyoWeakArray.enable();

  Md5.enable();
  Sha1.enable();
  Sha224.enable();
  Sha256.enable();
  Sha384.enable();
  Sha512.enable();
}
