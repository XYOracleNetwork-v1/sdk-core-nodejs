/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 3:41:00 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-signed.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 22nd August 2018 1:21:52 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOObject } from '../../../xyo-object';
import { XYONumberType } from '../xyo-number-type';

export abstract class XYONumberSigned extends XYOObject {
  public abstract readonly size: XYONumberType;
  public abstract readonly number: number;

  get data() {
    let buf: Buffer;

    switch (this.size) {
      case XYONumberType.BYTE:
        return Buffer.from([this.number]);
      case XYONumberType.SHORT:
        buf = new Buffer(2);
        buf.writeInt16BE(this.number, 0);
        return buf;
      case XYONumberType.INT:
        buf = new Buffer(4);
        buf.writeInt32BE(this.number, 0);
        return buf;
      case XYONumberType.LONG:
        // Lets have this be use-case driven. As soon as there
        // is a use-case we can implement support for it. As it
        // is now, support for byte operations is difficult with
        // numbers > 32-bit
        throw new Error(`This is not yet supported`);
      default:
        buf = new Buffer(4);
        buf.writeInt32BE(this.number, 0);
        return buf;
    }
  }
}
