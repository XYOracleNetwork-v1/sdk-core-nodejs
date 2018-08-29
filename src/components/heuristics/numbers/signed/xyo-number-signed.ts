/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 3:41:00 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-signed.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 3:11:57 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../xyo-object';
import { XyoNumberType } from '../xyo-number-type';
import { XyoResult } from '../../../xyo-result';
import { XyoError } from '../../../xyo-error';

/**
 * Abstract class to wrap signed numeric data-types in the Xyo Major/Minor
 */
export abstract class XyoNumberSigned extends XyoObject {

  /** Abstract classes should return the XyoNumberType corresponding to their type */
  public abstract readonly size: XyoNumberType;

  /** The underlying number value */
  public abstract readonly number: number;

  /**
   * Returns the byte-representation of the underlying number
   */
  get data () {
    let buf: Buffer;

    switch (this.size) {
      case XyoNumberType.BYTE:
        buf = Buffer.from([this.number]);
        break;
      case XyoNumberType.SHORT:
        buf = new Buffer(2);
        buf.writeInt16BE(this.number, 0);
        break;
      case XyoNumberType.INT:
        buf = new Buffer(4);
        buf.writeInt32BE(this.number, 0);
        break;
      case XyoNumberType.LONG:
        // Lets have this be use-case driven. As soon as there
        // is a use-case we can implement support for it. As it
        // is now, support for byte operations is difficult with
        // numbers > 32-bit
        return XyoResult.withError(
          new XyoError('This is not yet supported', XyoError.errorType.ERR_CRITICAL)
        ) as XyoResult<Buffer>;
      default:
        buf = new Buffer(4);
        buf.writeInt32BE(this.number, 0);
        break;
    }

    return XyoResult.withResult(buf);
  }
}