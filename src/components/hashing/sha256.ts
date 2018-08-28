/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:36:04 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha256.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:50:01 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Sha256 extends XyoBasicHashBase {
  public static enable () {
    Sha256.creator.enable();
  }

  private static creator = new XyoBasicHashBaseCreator('sha256', 32, 0x0b);

  get id () {
    return Buffer.from([Sha256.creator.major, Sha256.creator.minor]);
  }
}
