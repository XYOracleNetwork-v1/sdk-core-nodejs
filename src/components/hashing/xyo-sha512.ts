/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:43:18 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha384.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 3:35:27 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';
import { XyoResult } from '../xyo-result';

/**
 * Encapsulates Sha512 Hashing algorithm
 */
export class XyoSha512 extends XyoBasicHashBase {

  public static enable () {
    XyoSha512.creator.enable();
  }

  public static major () {
    return XyoSha512.creator.major;
  }

  public static minor () {
    return XyoSha512.creator.minor;
  }

  private static creator = new XyoBasicHashBaseCreator('sha512', 64, 0x0d);

  get id () {
    return XyoResult.withResult(Buffer.from([XyoSha512.creator.major, XyoSha512.creator.minor]));
  }
}
