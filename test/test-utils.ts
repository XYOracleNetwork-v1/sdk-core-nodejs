/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 1:36:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: test-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 23rd August 2018 11:45:08 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYORssi } from '../src/components/heuristics/numbers/signed/xyo-rssi';
import { Md5 } from '../src/components/hashing/md5';
import { Sha1 } from '../src/components/hashing/sha1';
import { Sha224 } from '../src/components/hashing/sha224';
import { Sha256 } from '../src/components/hashing/sha256';
import { Sha384 } from '../src/components/hashing/sha384';
import { Sha512 } from '../src/components/hashing/sha512';
import { XYOStrongArray } from '../src/components/arrays/xyo-strong-array';
import { XYOWeakArray } from '../src/components/arrays/xyo-weak-array';

export function loadAllTypes() {
  XYORssi.enable();
  XYOStrongArray.enable();
  XYOWeakArray.enable();

  Md5.enable();
  Sha1.enable();
  Sha224.enable();
  Sha256.enable();
  Sha384.enable();
  Sha512.enable();
}
