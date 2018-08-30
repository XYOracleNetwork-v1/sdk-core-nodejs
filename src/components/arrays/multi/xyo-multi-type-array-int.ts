/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 12:43:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-multi-type-array-int.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 30th August 2018 12:45:56 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoMultiTypeArrayBase } from './xyo-multi-type-array-base';
import { XyoArrayCreator } from '../xyo-array-base';
import { XyoResult } from '../../xyo-result';
import { XyoArrayUnpacker } from '../xyo-array-unpacker';
import { XyoObject } from '../../xyo-object';

class XyoMultiTypeArrayIntCreator extends XyoArrayCreator {

  get minor () {
    return 0x06;
  }

  get sizeOfBytesToGetSize () {
    return 4;
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(buffer.readUInt32BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, false, 4);
    const unpackedArrayObject = new XyoMultiTypeArrayInt(unpackedArray.array);
    return XyoResult.withValue(unpackedArrayObject);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoMultiTypeArrayInt extends XyoMultiTypeArrayBase {

  public static enable () {
    XyoMultiTypeArrayInt.enable();
  }

  public static major () {
    return XyoMultiTypeArrayInt.creator.major;
  }

  public static minor () {
    return XyoMultiTypeArrayInt.creator.minor;
  }

  private static creator = new XyoMultiTypeArrayIntCreator();

  constructor (public readonly array: XyoObject[]) {
    super();
  }

  get id () {
    return XyoResult.withValue(Buffer.from([
      XyoMultiTypeArrayInt.creator.major,
      XyoMultiTypeArrayInt.creator.minor
    ]));
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(
      XyoMultiTypeArrayInt.creator.sizeOfBytesToGetSize
    );
  }
}
