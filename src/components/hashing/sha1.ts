/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:03:41 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha1.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:50:00 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Sha1 extends XyoBasicHashBase {
  public static enable () {
    Sha1.creator.enable();
  }

  private static creator = new XyoBasicHashBaseCreator('sha1', 20, 0x02);

  get id () {
    return Buffer.from([Sha1.creator.major, Sha1.creator.minor]);
  }
}
