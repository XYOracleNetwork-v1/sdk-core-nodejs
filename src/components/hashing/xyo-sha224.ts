/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:33:11 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha224.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 3:01:13 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';

/**
 * Encapsulates Sha224 Hashing algorithm
 */
export class XyoSha224 extends XyoBasicHashBase {

  public static enable () {
    XyoSha224.creator.enable();
  }

  public static major () {
    return XyoSha224.creator.major;
  }

  public static minor () {
    return XyoSha224.creator.minor;
  }

  private static creator = new XyoBasicHashBaseCreator('sha224', 20, 0x0a);

  get id () {
    return Buffer.from([XyoSha224.creator.major, XyoSha224.creator.minor]);
  }
}
