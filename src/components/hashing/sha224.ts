/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:33:11 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha224.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 23rd August 2018 10:46:19 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XYOBasicHashBase,
  XYOBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Sha224 extends XYOBasicHashBase {
  public static enable () {
    Sha224.creator.enable();
  }

  private static creator = new XYOBasicHashBaseCreator('sha224', 20, 0x0a);

  get id () {
    return Buffer.from([Sha224.creator.major, Sha224.creator.minor]);
  }
}
