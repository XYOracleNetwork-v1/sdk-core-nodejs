/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 1:15:42 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-unsigned.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:54:24 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../xyo-object';
import { XyoNumberSigned } from '../signed/xyo-number-signed';
import { XyoNumberType } from '../xyo-number-type';

export abstract class XyoNumberUnsigned extends XyoObject {
  public abstract size: XyoNumberType;
  public abstract number: number;

  get data () {
    let buf: Buffer;

    switch (this.size) {
      case XyoNumberType.BYTE:
        return Buffer.from([this.number]);
      case XyoNumberType.SHORT:
        buf = new Buffer(2);
        buf.writeUInt16BE(this.number, 0);
        return buf;
      case XyoNumberType.INT:
        buf = new Buffer(4);
        buf.writeUInt32BE(this.number, 0);
        return buf;
      case XyoNumberType.LONG:
        buf = new Buffer(8);
        buf.writeUInt32BE(Math.floor((this.number / Math.pow(2, 32))), 0);
        buf.writeUInt32BE(this.number % Math.pow(2, 32), 4);
        return buf;
      default:
        buf = new Buffer(4);
        buf.writeUInt32BE(this.number, 0);
        return buf;
    }
  }
}
