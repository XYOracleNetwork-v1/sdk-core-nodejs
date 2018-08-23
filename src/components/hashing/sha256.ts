/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:36:04 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha256.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 23rd August 2018 10:46:24 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XYOBasicHashBase,
  XYOBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Sha256 extends XYOBasicHashBase {
  public static enable () {
    Sha256.creator.enable();
  }

  private static creator = new XYOBasicHashBaseCreator('sha256', 32, 0x0b);

  get id () {
    return Buffer.from([Sha256.creator.major, Sha256.creator.minor]);
  }
}
