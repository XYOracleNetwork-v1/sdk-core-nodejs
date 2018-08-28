/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:43:18 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha384.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:50:04 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Sha512 extends XyoBasicHashBase {
  public static enable () {
    Sha512.creator.enable();
  }

  private static creator = new XyoBasicHashBaseCreator('sha512', 64, 0x0d);

  get id () {
    return Buffer.from([Sha512.creator.major, Sha512.creator.minor]);
  }
}
