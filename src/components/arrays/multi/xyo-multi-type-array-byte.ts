/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 12:28:57 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-multi-type-array-byte.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 30th August 2018 12:39:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoMultiTypeArrayBase } from './xyo-multi-type-array-base';
import { XyoArrayCreator } from '../xyo-array-base';
import { XyoResult } from '../../xyo-result';
import { XyoArrayUnpacker } from '../xyo-array-unpacker';
import { XyoObject } from '../../xyo-object';

class XyoMultiTypeArrayByteCreator extends XyoArrayCreator {

  get minor () {
    return 0x04;
  }

  get sizeOfBytesToGetSize () {
    return 1;
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(buffer.readUInt8(0));
  }

  public createFromPacked(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, false, 1);
    const unpackedArrayObject = new XyoMultiTypeArrayByte(unpackedArray.array);
    return XyoResult.withValue(unpackedArrayObject);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoMultiTypeArrayByte extends XyoMultiTypeArrayBase {

  public static enable () {
    XyoMultiTypeArrayByte.enable();
  }

  public static major () {
    return XyoMultiTypeArrayByte.creator.major;
  }

  public static minor () {
    return XyoMultiTypeArrayByte.creator.minor;
  }

  private static creator = new XyoMultiTypeArrayByteCreator();

  constructor (public readonly array: XyoObject[]) {
    super();
  }

  get id () {
    return XyoResult.withValue(Buffer.from([
      XyoMultiTypeArrayByte.creator.major,
      XyoMultiTypeArrayByte.creator.minor
    ]));
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(
      XyoMultiTypeArrayByte.creator.sizeOfBytesToGetSize
    );
  }
}
