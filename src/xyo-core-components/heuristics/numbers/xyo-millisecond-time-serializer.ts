/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 19th October 2018 5:24:33 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-millisecond-time-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 22nd October 2018 9:43:26 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoMillisecondTime } from './xyo-millisecond-time';
import BN from 'bn.js';

/**
 * A general purpose signed number serializer serializer
 *
 * @export
 * @class XyoNumberSignedSerializer
 * @extends {XyoSerializer<XyoNumberSigned>}
 */
export class XyoMillisecondTimeSerializer extends XyoSerializer<XyoMillisecondTime> {

  /**
   * Creates an instance of XyoNumberSignedSerializer
   * @param {number} major The major value of the number-type
   * @param {number} minor The minor value of the number-type
   * @param {XyoNumberType} size The size indicator of the number
   * @memberof XyoNumberSignedSerializer
   */

  constructor() {
    super();
  }

  get description () {
    return {
      major: XyoMillisecondTime.major,
      minor: XyoMillisecondTime.minor,
      staticSize: 8,
      sizeIdentifierSize: 0
    };
  }

  /**
   * Get object representation of a XyoMillisecondTime from the bytes-representation
   *
   * @param {Buffer} buffer The byte representation
   * @returns {XyoMillisecondTime} An instance of a `XyoMillisecondTime`
   * @memberof XyoMillisecondTimeSerializer
   */

  public deserialize(buffer: Buffer): XyoMillisecondTime {
    const hexValue = buffer.toString('hex');
    const bigNumber = new BN(hexValue, 16);
    const numberRepresentation = bigNumber.toNumber();
    return new XyoMillisecondTime(numberRepresentation);
  }

  /**
   * Get the byte representation of a `XyoNumberSigned`
   *
   * @param {XyoMillisecondTime} signedNumber The instance to serialize
   * @returns {Buffer} The byte representation of the the XyoMillisecondTime
   * @memberof XyoMillisecondTimeSerializer
   */

  public serialize(time: XyoMillisecondTime): Buffer {
    const numberRepresentation = time.number;
    const bn = new BN(numberRepresentation);
    return bn.toBuffer('be', 8);
  }
}
