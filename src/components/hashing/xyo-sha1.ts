/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:03:41 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha1.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 1:33:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';
import { XyoResult } from '../xyo-result';

/**
 * Encapsulates Sha1 Hashing algorithm
 */
export class XyoSha1 extends XyoBasicHashBase {

  public static creator = new XyoBasicHashBaseCreator('sha1', 20, 0x02);

  get id () {
    return XyoResult.withValue(Buffer.from([XyoSha1.creator.major, XyoSha1.creator.minor]));
  }
}
