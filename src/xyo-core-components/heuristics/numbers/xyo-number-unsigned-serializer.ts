/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:17:47 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-unsigned-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 1:19:34 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoNumberUnsigned } from './xyo-number-unsigned';
import { XyoNumberType } from './xyo-number-type';
import { XyoError, XyoErrors } from '../../xyo-error';

/**
 * A general purpose unsigned number serializer serializer
 *
 * @export
 * @class XyoNumberUnsignedSerializer
 * @extends {XyoSerializer<XyoNumberUnsigned>}
 */
export class XyoNumberUnsignedSerializer extends XyoSerializer<XyoNumberUnsigned> {

  /**
   * Creates an instance of XyoNumberUnsignedSerializer
   *
   * @param {number} major The major value of the number-type
   * @param {number} minor The minor value of the number-type
   * @param {XyoNumberType} size The size indicator of the number
   * @memberof XyoNumberUnsignedSerializer
   */

  constructor(private readonly major: number, private readonly minor: number, private readonly size: XyoNumberType) {
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

  /**
   * Get object representation of a XyoNumberUnsigned from the bytes-representation
   *
   * @param {Buffer} buffer The byte representation
   * @returns {XyoNumberUnsigned} An instance of a `XyoNumberUnsigned`
   * @memberof XyoNumberUnsignedSerializer
   */

  public deserialize(buffer: Buffer): XyoNumberUnsigned {
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
        throw new XyoError('This is not yet supported', XyoErrors.CRITICAL);
      default:
        throw new XyoError('This should never happen', XyoErrors.CRITICAL);
    }

    return new XyoNumberUnsigned(number, this.major, this.minor, this.size);
  }

  /**
   * Get the byte representation of a `XyoNumberUnsigned`
   *
   * @param {XyoNumberUnsigned} signedNumber The instance to serialize
   * @returns {Buffer} The byte representation of the the XyoNumberUnsigned
   * @memberof XyoNumberUnsignedSerializer
   */

  public serialize(unsignedNumber: XyoNumberUnsigned): Buffer {
    let buf: Buffer;

    switch (this.size) {
      case XyoNumberType.BYTE:
        buf = Buffer.from([unsignedNumber.number]);
        break;
      case XyoNumberType.SHORT:
        buf = Buffer.alloc(2);
        buf.writeUInt16BE(unsignedNumber.number, 0);
        break;
      case XyoNumberType.INT:
        buf = Buffer.alloc(4);
        buf.writeUInt32BE(unsignedNumber.number, 0);
        break;
      case XyoNumberType.LONG:
        throw new XyoError('This is not yet supported', XyoErrors.CRITICAL);
      default:
        throw new XyoError('This should never happen', XyoErrors.CRITICAL);
    }

    return buf;
  }
}
