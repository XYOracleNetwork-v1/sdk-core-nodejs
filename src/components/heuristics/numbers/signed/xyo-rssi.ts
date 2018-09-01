/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 12:46:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rssi.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 5th September 2018 5:54:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNumberSigned } from './xyo-number-signed';
import { XyoNumberType } from '../xyo-number-type';
import { XyoObjectCreator } from '../../../xyo-object-creator';
import { XyoObject } from '../../../xyo-object';
import { XyoResult } from '../../../xyo-result';

/**
 * The corresponding Creator class for XyoRssi
 */
class XyoRssiObjectCreator extends XyoObjectCreator {

  get major () {
    return 0x08;
  }

  get minor () {
    return 0x01;
  }

  get sizeOfBytesToGetSize () {
    return XyoResult.withValue(0);
  }

  public readSize (buffer: Buffer) {
    return XyoResult.withValue(1);
  }

  public createFromPacked(byteArray: Buffer) {
    return XyoResult.withValue(new XyoRssi(byteArray.readInt8(0)));
  }
}

/**
 * An XyoRssi class represents the  "Received signal strength indication"
 *
 * An Rssi value in the Xyo system is a signed number with 8 bits (1 byte) of resolution.
 */

// tslint:disable-next-line:max-classes-per-file
export class XyoRssi extends XyoNumberSigned {

  public static creator = new XyoRssiObjectCreator();

  /**
   * Creates a new instance of an XyoRssi
   *
   * @param rssi The distance to represent
   */

  constructor (private readonly rssi: number) {
    super();
  }

  /**
   * Returns the underlying numeric value of the rssi data-point
   */

  get number () {
    return this.rssi;
  }

  /**
   * Returns the `XyoNumberType` corresponding the size of the rssi
   */
  get size () {
    return XyoNumberType.BYTE;
  }

  /**
   * Returns the id in accordance with the Major/Minor Xyo protocol
   */

  get id () {
    return XyoRssi.creator.id;
  }

  /**
   * Since size is known and is not dynamic, this will return `null`
   */

  get sizeIdentifierSize () {
    return XyoResult.withValue(null);
  }
}
