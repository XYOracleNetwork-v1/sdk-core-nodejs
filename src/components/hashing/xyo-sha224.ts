/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:33:11 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha224.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 3:21:30 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';
import { XyoResult } from '../xyo-result';

/**
 * Encapsulates Sha224 Hashing algorithm
 */
export class XyoSha224 extends XyoBasicHashBase {

  public static creator = new XyoBasicHashBaseCreator('sha224', 20, 0x0a);

  get id () {
    return XyoSha224.creator.id;
  }
}
