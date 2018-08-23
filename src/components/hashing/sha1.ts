/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:03:41 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha1.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 23rd August 2018 10:46:10 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XYOBasicHashBase,
  XYOBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Sha1 extends XYOBasicHashBase {
  public static enable () {
    Sha1.creator.enable();
  }

  private static creator = new XYOBasicHashBaseCreator('sha1', 20, 0x02);

  get id () {
    return Buffer.from([Sha1.creator.major, Sha1.creator.minor]);
  }
}
