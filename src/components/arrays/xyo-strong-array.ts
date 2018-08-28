/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 11:05:19 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-strong-array.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:48:43 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayBase } from './xyo-array-base';
import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoArrayUnpacker } from './xyo-array-unpacker';
import { XyoObject } from '../xyo-object';

class XyoStrongArrayObjectCreator extends XyoObjectCreator {

  get major () {
    return 0x01;
  }

  get minor () {
    return 0x02;
  }

  get defaultSize () {
    return null;
  }

  get sizeOfSize () {
    return 4;
  }

  public createFromPacked(byteArray: Buffer): XyoObject {
    const unpackedArray = new XyoArrayUnpacker(byteArray, true, 4, 4);
    const unpackedArrayObject = new XyoStrongArray(unpackedArray.majorType!, unpackedArray.minorType!);
    unpackedArrayObject.array = unpackedArray.array;
    return unpackedArrayObject;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoStrongArray extends XyoArrayBase {

  public static enable () {
    XyoStrongArray.creator.enable();
  }

  private static creator = new XyoStrongArrayObjectCreator();

  constructor(private readonly major: number, private readonly minor: number) {
    super();
  }

  get arraySize () {
    const buf = new Buffer(4);
    buf.writeUInt32BE(this.size, 0);
    return buf;
  }

  get typedId () {
    return Buffer.from([this.major, this.minor]);
  }

  get id () {
    return Buffer.from([this.major, this.minor]);
  }

  get sizeIdentifierSize () {
    return XyoStrongArray.creator.sizeOfSize;
  }

  public addElement(element: XyoObject, index?: number) {
    if (element.id[0] === this.major && element.id[1] === this.minor) {
      return super.addElement(element, index);
    }

    throw new Error(`Element could not be added to array, wrong type`);
  }
}
