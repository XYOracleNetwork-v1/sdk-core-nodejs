/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:32:03 am
 * @Email:  developer@xyfindables.com
 * @Filename: md5.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:49:59 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Md5 extends XyoBasicHashBase {
  public static enable () {
    Md5.creator.enable();
  }

  private static creator = new XyoBasicHashBaseCreator('md5', 16, 0x10);

  get id () {
    return Buffer.from([Md5.creator.major, Md5.creator.minor]);
  }
}
