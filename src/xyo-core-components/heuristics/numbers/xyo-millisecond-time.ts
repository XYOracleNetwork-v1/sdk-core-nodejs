
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 19th October 2018 3:53:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-millisecond-time.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 19th October 2018 3:57:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNumberUnsigned } from "./xyo-number-unsigned";
import { XyoNumberType } from "./xyo-number-type";

/**
 * A time heuristic represented in milliseconds from epoch in 8 bytes
 *
 * @export
 * @class XyoMillisecondTime
 * @extends {XyoNumberUnsigned}
 */
export class XyoMillisecondTime extends XyoNumberUnsigned {
  public static major = 0x0d;
  public static minor = 0x0f;

  constructor(time?: number) {
    super(time || new Date().valueOf(), XyoMillisecondTime.major, XyoMillisecondTime.minor, XyoNumberType.LONG);
  }
}
