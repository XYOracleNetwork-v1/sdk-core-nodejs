/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:43:18 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha384.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 23rd August 2018 10:46:29 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XYOBasicHashBase,
  XYOBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Sha384 extends XYOBasicHashBase {
  public static enable () {
    Sha384.creator.enable();
  }

  private static creator = new XYOBasicHashBaseCreator('sha384', 48, 0x0c);

  get id () {
    return Buffer.from([Sha384.creator.major, Sha384.creator.minor]);
  }
}
