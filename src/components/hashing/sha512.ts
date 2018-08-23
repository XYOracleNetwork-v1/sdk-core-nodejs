/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:43:18 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha384.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 23rd August 2018 10:45:57 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XYOBasicHashBase,
  XYOBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Sha512 extends XYOBasicHashBase {
  public static enable () {
    Sha512.creator.enable();
  }

  private static creator = new XYOBasicHashBaseCreator('sha512', 64, 0x0d);

  get id () {
    return Buffer.from([Sha512.creator.major, Sha512.creator.minor]);
  }
}
