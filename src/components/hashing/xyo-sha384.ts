/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:43:18 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha384.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 3:22:01 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';
import { XyoResult } from '../xyo-result';

/**
 * Encapsulates Sha384 Hashing algorithm
 */
export class XyoSha384 extends XyoBasicHashBase {

  public static creator = new XyoBasicHashBaseCreator('sha384', 48, 0x0c);

  get id () {
    return XyoSha384.creator.id;
  }
}
