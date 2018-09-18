/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:17:47 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rssi-object-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 4:56:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOSerializer } from '../xyo-serializer';
import { XyoNumberUnsigned } from '../../components/heuristics/numbers/xyo-number-unsigned';
import { XyoNumberType } from '../../components/heuristics/numbers/xyo-number-type';
import { XyoError } from '../../components/xyo-error';

export class XyoNumberUnsignedSerializer extends XYOSerializer<XyoNumberUnsigned> {

  constructor(
    private readonly major: number,
    private readonly minor: number,
    private readonly size: XyoNumberType
  ) {
    super();
  }

  get description () {
    return {
      major: this.major,
      minor: this.minor,
      staticSize: this.size
    };
  }

  public deserialize(buffer: Buffer) {
    let number: number | undefined;

    switch (this.size) {
      case XyoNumberType.BYTE:
        number = buffer.readUInt8(0);
        break;
      case XyoNumberType.SHORT:
        number = buffer.readUInt16BE(0);
        break;
      case XyoNumberType.INT:
        number = buffer.readUInt32BE(0);
        break;
      case XyoNumberType.LONG:
        throw new XyoError('This is not yet supported', XyoError.errorType.ERR_CRITICAL);
      default:
        throw new XyoError('This should never happen', XyoError.errorType.ERR_CRITICAL);
    }

    return new XyoNumberUnsigned(number, this.major, this.minor, this.size);
  }

  public serialize(unsignedNumber: XyoNumberUnsigned) {
    let buf: Buffer;

    switch (this.size) {
      case XyoNumberType.BYTE:
        buf = Buffer.from([unsignedNumber.number]);
        break;
      case XyoNumberType.SHORT:
        buf = new Buffer(2);
        buf.writeUInt16BE(unsignedNumber.number, 0);
        break;
      case XyoNumberType.INT:
        buf = new Buffer(4);
        buf.writeUInt32BE(unsignedNumber.number, 0);
        break;
      case XyoNumberType.LONG:
        throw new XyoError('This is not yet supported', XyoError.errorType.ERR_CRITICAL);
      default:
        throw new XyoError('This should never happen', XyoError.errorType.ERR_CRITICAL);
    }

    return buf;
  }
}
