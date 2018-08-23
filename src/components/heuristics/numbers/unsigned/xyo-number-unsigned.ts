/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 1:15:42 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-unsigned.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 22nd August 2018 1:21:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOObject } from '../../../xyo-object';
import { XYONumberSigned } from '../signed/xyo-number-signed';
import { XYONumberType } from '../xyo-number-type';

export abstract class XYONumberUnsigned extends XYOObject {
  public abstract size: XYONumberType;
  public abstract number: number;

  get data () {
    let buf: Buffer;

    switch (this.size) {
      case XYONumberType.BYTE:
        return Buffer.from([this.number]);
      case XYONumberType.SHORT:
        buf = new Buffer(2);
        buf.writeUInt16BE(this.number, 0);
        return buf;
      case XYONumberType.INT:
        buf = new Buffer(4);
        buf.writeUInt32BE(this.number, 0);
        return buf;
      case XYONumberType.LONG:
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
