/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 9:50:27 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-weak-array.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:52:22 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayBase } from './xyo-array-base';
import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoObject } from '../xyo-object';
import { XyoArrayUnpacker } from './xyo-array-unpacker';

class XyoWeakArrayObjectCreator extends XyoObjectCreator {

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

  public createFromPacked(byteArray: Buffer): XyoObject {
    const unpackedArray = new XyoArrayUnpacker(byteArray, false, 4, 4);
    const unpackedArrayObject = new XyoWeakArray();
    unpackedArrayObject.array = unpackedArray.array;
    return unpackedArrayObject;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoWeakArray extends XyoArrayBase {

  public static enable () {
    XyoWeakArray.creator.enable();
  }

  private static creator = new XyoWeakArrayObjectCreator();

  get arraySize () {
    const buffer = new Buffer(4);
    buffer.writeUInt32BE(this.size, 0);
    return buffer;
  }

  get typedId () {
    return null;
  }

  get id () {
    return Buffer.from([XyoWeakArray.creator.major, XyoWeakArray.creator.minor]);
  }

  get sizeIdentifierSize () {
    return XyoWeakArray.creator.sizeOfSize;
  }
}
