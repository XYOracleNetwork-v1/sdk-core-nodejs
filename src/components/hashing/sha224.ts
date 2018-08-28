/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:33:11 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha224.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:50:01 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Sha224 extends XyoBasicHashBase {
  public static enable () {
    Sha224.creator.enable();
  }

  private static creator = new XyoBasicHashBaseCreator('sha224', 20, 0x0a);

  get id () {
    return Buffer.from([Sha224.creator.major, Sha224.creator.minor]);
  }
}
