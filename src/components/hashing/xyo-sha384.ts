/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:43:18 am
 * @Email:  developer@xyfindables.com
 * @Filename: sha384.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 3:35:13 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBasicHashBase,
  XyoBasicHashBaseCreator
} from './xyo-basic-hash-base';
import { XyoResult } from '../xyo-result';

/**
 * Encapsulates Sha384 Hashing algorithm
 */
export class XyoSha384 extends XyoBasicHashBase {
  public static enable () {
    XyoSha384.creator.enable();
  }

  public static major () {
    return XyoSha384.creator.major;
  }

  public static minor () {
    return XyoSha384.creator.minor;
  }

  private static creator = new XyoBasicHashBaseCreator('sha384', 48, 0x0c);

  get id () {
    return XyoResult.withResult(Buffer.from([XyoSha384.creator.major, XyoSha384.creator.minor]));
  }
}