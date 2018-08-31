/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:36:04 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha256.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 1:34:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';
import { XyoResult } from '../xyo-result';

/**
 * Encapsulates Sha256 Hashing algorithm
 */
export class XyoSha256 extends XyoBasicHashBase {

  public static creator = new XyoBasicHashBaseCreator('sha256', 32, 0x0b);

  get id () {
    return XyoResult.withValue(Buffer.from([XyoSha256.creator.major, XyoSha256.creator.minor]));
  }
}
