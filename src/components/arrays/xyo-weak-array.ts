/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 9:50:27 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-weak-array.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 22nd August 2018 2:00:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOArrayBase } from './xyo-array-base';
import { XYOObjectCreator } from '../xyo-object-creator';
import { XYOObject } from '../xyo-object';
import { XYOArrayUnpacker } from './xyo-array-unpacker';

class XYOWeakArrayObjectCreator extends XYOObjectCreator {

  get major () {
    return 0x01;
  }

  get minor () {
    return 0x03;
  }

  get defaultSize () {
    return null;
  }

  get sizeOfSize () {
    return 4;
  }

  public createFromPacked(byteArray: Buffer): XYOObject {
    const unpackedArray = new XYOArrayUnpacker(byteArray, false, 4, 4);
    const unpackedArrayObject = new XYOWeakArray();
    unpackedArrayObject.array = unpackedArray.array;
    return unpackedArrayObject;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XYOWeakArray extends XYOArrayBase {

  public static enable () {
    XYOWeakArray.creator.enable();
  }

  private static creator = new XYOWeakArrayObjectCreator();

  get arraySize () {
    const buffer = new Buffer(4);
    buffer.writeUInt32BE(this.size, 0);
    return buffer;
  }

  get typedId () {
    return null;
  }

  get id () {
    return Buffer.from([XYOWeakArray.creator.major, XYOWeakArray.creator.minor]);
  }

  get sizeIdentifierSize () {
    return XYOWeakArray.creator.sizeOfSize;
  }
}
