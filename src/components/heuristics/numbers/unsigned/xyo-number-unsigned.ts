/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 1:15:42 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-unsigned.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 3:22:42 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../xyo-object';
import { XyoNumberType } from '../xyo-number-type';

/**
 * Abstract class to wrap unsigned numeric data-types in the Xyo Major/Minor
 */
export abstract class XyoNumberUnsigned extends XyoObject {

  /** Abstract classes should return the XyoNumberType corresponding to their type */
  public abstract size: XyoNumberType;

  /** The underlying number value */
  public abstract number: number;

  /**
   * Returns the byte-representation of the underlying number
   */

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
        // buf = new Buffer(8);
        // buf.writeUInt32BE(Math.floor((this.number / Math.pow(2, 32))), 0);
        // buf.writeUInt32BE(this.number % Math.pow(2, 32), 4);
        // return buf;
        //
        // Lets have this be use-case driven. As soon as there
        // is a use-case we can implement support for it. As it
        // is now, support for byte operations is difficult with
        // numbers > 32-bit
        throw new Error(`This is not yet supported`);
      default:
        buf = new Buffer(4);
        buf.writeUInt32BE(this.number, 0);
        return buf;
    }
  }
}
