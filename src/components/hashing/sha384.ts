/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:43:18 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha384.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:50:02 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';

export class Sha384 extends XyoBasicHashBase {
  public static enable () {
    Sha384.creator.enable();
  }

  private static creator = new XyoBasicHashBaseCreator('sha384', 48, 0x0c);

  get id () {
    return Buffer.from([Sha384.creator.major, Sha384.creator.minor]);
  }
}
