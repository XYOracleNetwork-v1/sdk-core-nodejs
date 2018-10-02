/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:17:47 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rssi-object-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 26th September 2018 1:18:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOSerializer } from '../xyo-serializer';
import { XyoNumberType } from '../../components/heuristics/numbers/xyo-number-type';
import { XyoNumberSigned } from '../../components/heuristics/numbers/xyo-number-signed';
import { XyoError } from '../../components/xyo-error';

export class XyoNumberSignedSerializer extends XYOSerializer<XyoNumberSigned> {

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
      staticSize: this.size,
      sizeIdentifierSize: 0
    };
  }

  public deserialize(buffer: Buffer) {
    let number: number | undefined;

    switch (this.size) {
      case XyoNumberType.BYTE:
        number = buffer.readInt8(0);
        break;
      case XyoNumberType.SHORT:
        number = buffer.readInt16BE(0);
        break;
      case XyoNumberType.INT:
        number = buffer.readInt32BE(0);
        break;
      case XyoNumberType.LONG:
        throw new XyoError('This is not yet supported', XyoError.errorType.ERR_CRITICAL);
      default:
        throw new XyoError('This should never happen', XyoError.errorType.ERR_CRITICAL);
    }

    return new XyoNumberSigned(number, this.major, this.minor, this.size);
  }

  public serialize(signedNumber: XyoNumberSigned) {
    let buf: Buffer;

    switch (this.size) {
      case XyoNumberType.BYTE:
        buf = Buffer.from([signedNumber.number]);
        break;
      case XyoNumberType.SHORT:
        buf = Buffer.alloc(2);
        buf.writeInt16BE(signedNumber.number, 0);
        break;
      case XyoNumberType.INT:
        buf = Buffer.alloc(4);
        buf.writeInt32BE(signedNumber.number, 0);
        break;
      case XyoNumberType.LONG:
        throw new XyoError('This is not yet supported', XyoError.errorType.ERR_CRITICAL);
      default:
        throw new XyoError('This should never happen', XyoError.errorType.ERR_CRITICAL);
    }

    return buf;
  }
}
