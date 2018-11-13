/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 29th October 2018 1:47:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-gps.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 12:50:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from "../../xyo-object";

export class XyoGps extends XyoObject {

  public static major = 0x0f;
  public static minor = 0x1f;

  constructor(public readonly lat: number, public readonly long: number) {
    super(XyoGps.major, XyoGps.minor);
  }

  public getReadableName(): string {
    return 'gps';
  }

  public getReadableValue() {
    return {
      lat: this.lat,
      long: this.long
    };
  }
}
