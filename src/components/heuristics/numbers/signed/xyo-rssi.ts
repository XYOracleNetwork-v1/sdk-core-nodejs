/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 12:46:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rssi.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:54:32 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNumberSigned } from './xyo-number-signed';
import { XyoNumberType } from '../xyo-number-type';
import { XyoObjectCreator } from '../../../xyo-object-creator';
import { XyoObject } from '../../../xyo-object';

class XyoRssiObjectCreator extends XyoObjectCreator {

  get major () {
    return 0x02;
  }

  get minor () {
    return 0x03;
  }

  get defaultSize () {
    return 1;
  }

  get sizeOfSize () {
    return null;
  }

  public createFromPacked(byteArray: Buffer): XyoObject {
    if (byteArray.length !== 3) {
      throw new Error(`Can not unpacked a byte-array`);
    }

    return new XyoRssi(byteArray.readInt8(2));
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoRssi extends XyoNumberSigned {
  public static enable() {
    XyoRssi.creator.enable();
  }

  private static creator = new XyoRssiObjectCreator();

  constructor (private readonly rssi: number) {
    super();
  }

  get number () {
    return this.rssi;
  }

  get size () {
    return XyoNumberType.BYTE;
  }

  get id () {
    return Buffer.from([XyoRssi.creator.major, XyoRssi.creator.minor]);
  }

  get sizeIdentifierSize () {
    return null;
  }
}
