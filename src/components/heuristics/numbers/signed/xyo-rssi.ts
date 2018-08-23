/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 12:46:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rssi.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 22nd August 2018 1:56:34 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYONumberSigned } from './xyo-number-signed';
import { XYONumberType } from '../xyo-number-type';
import { XYOObjectCreator } from '../../../xyo-object-creator';
import { XYOObject } from '../../../xyo-object';

class XYORssiObjectCreator extends XYOObjectCreator {

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

  public createFromPacked(byteArray: Buffer): XYOObject {
    if (byteArray.length !== 3) {
      throw new Error(`Can not unpacked a byte-array`);
    }

    return new XYORssi(byteArray.readInt8(2));
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XYORssi extends XYONumberSigned {
  public static enable() {
    XYORssi.creator.enable();
  }

  private static creator = new XYORssiObjectCreator();

  constructor (private readonly rssi: number) {
    super();
  }

  get number () {
    return this.rssi;
  }

  get size () {
    return XYONumberType.BYTE;
  }

  get id () {
    return Buffer.from([XYORssi.creator.major, XYORssi.creator.minor]);
  }

  get sizeIdentifierSize () {
    return null;
  }
}
