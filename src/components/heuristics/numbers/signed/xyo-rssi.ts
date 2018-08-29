/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 12:46:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rssi.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 4:55:09 pm
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
    return 0x02;
  }

  get minor () {
    return 0x03;
  }

  get sizeOfBytesToGetSize () {
    return null;
  }

  public readSize (buffer: Buffer) {
    return XyoResult.withValue(1);
  }

  public createFromPacked(byteArray: Buffer) {
    if (byteArray.length !== 3) {
      throw new Error(`Can not unpacked a byte-array`);
    }

    return XyoResult.withValue(new XyoRssi(byteArray.readInt8(2)));
  }
}

/**
 * An XyoRssi class represents the  "Received signal strength indication"
 *
 * An Rssi value in the Xyo system is a signed number with 8 bits (1 byte) of resolution.
 */

// tslint:disable-next-line:max-classes-per-file
export class XyoRssi extends XyoNumberSigned {

  public static enable() {
    XyoRssi.creator.enable();
  }

  public static major () {
    return XyoRssi.creator.major;
  }

  public static minor () {
    return XyoRssi.creator.minor;
  }

  private static creator = new XyoRssiObjectCreator();

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
    return XyoResult.withValue(Buffer.from([XyoRssi.creator.major, XyoRssi.creator.minor]));
  }

  /**
   * Since size is known and is not dynamic, this will return `null`
   */

  get sizeIdentifierSize () {
    return XyoResult.withValue(null);
  }
}
