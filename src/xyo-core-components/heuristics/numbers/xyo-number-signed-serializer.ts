/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:17:47 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-number-signed-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 3:23:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoNumberType } from './xyo-number-type';
import { XyoNumberSigned } from './xyo-number-signed';
import { XyoError, XyoErrors } from '../../xyo-error';

/**
 * A general purpose signed number serializer serializer
 *
 * @export
 * @class XyoNumberSignedSerializer
 * @extends {XyoSerializer<XyoNumberSigned>}
 */
export class XyoNumberSignedSerializer extends XyoSerializer<XyoNumberSigned> {

  /**
   * Creates an instance of XyoNumberSignedSerializer
   * @param {number} major The major value of the number-type
   * @param {number} minor The minor value of the number-type
   * @param {XyoNumberType} size The size indicator of the number
   * @memberof XyoNumberSignedSerializer
   */

  constructor(
    private readonly major: number,
    private readonly minor: number,
    private readonly size: XyoNumberType,
    private readonly ctor?: { new (num: number): XyoNumberSigned}
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

  /**
   * Get object representation of a XyoNumberSigned from the bytes-representation
   *
   * @param {Buffer} buffer The byte representation
   * @returns {XyoNumberSigned} An instance of a `XyoNumberSigned`
   * @memberof XyoNumberSignedSerializer
   */

  public deserialize(buffer: Buffer): XyoNumberSigned {
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
        throw new XyoError('This is not yet supported', XyoErrors.CRITICAL);
      default:
        throw new XyoError('This should never happen', XyoErrors.CRITICAL);
    }

    if (this.ctor) {
      return new this.ctor(number);
    }

    return new XyoNumberSigned(number, this.major, this.minor, this.size);
  }

  /**
   * Get the byte representation of a `XyoNumberSigned`
   *
   * @param {XyoNumberSigned} signedNumber The instance to serialize
   * @returns {Buffer} The byte representation of the the XyoNumberSigned
   * @memberof XyoNumberSignedSerializer
   */

  public serialize(signedNumber: XyoNumberSigned): Buffer {
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
        throw new XyoError('This is not yet supported', XyoErrors.CRITICAL);
      default:
        throw new XyoError('This should never happen', XyoErrors.CRITICAL);
    }

    return buf;
  }
}
