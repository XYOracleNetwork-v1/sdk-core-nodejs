/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:32:03 am
 * @Email:  developer@xyfindables.com
 * @Filename: md5.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 4:29:04 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';
import { XyoResult } from '../xyo-result';

/**
 * Encapsulates Md5 Hashing algorithm
 */
export class XyoMd5 extends XyoBasicHashBase {

  public static enable () {
    XyoMd5.creator.enable();
  }

  public static major () {
    return XyoMd5.creator.major;
  }

  public static minor () {
    return XyoMd5.creator.minor;
  }

  private static creator = new XyoBasicHashBaseCreator('md5', 16, 0x10);

  get id () {
    return XyoResult.withValue(Buffer.from([XyoMd5.creator.major, XyoMd5.creator.minor]));
  }
}
