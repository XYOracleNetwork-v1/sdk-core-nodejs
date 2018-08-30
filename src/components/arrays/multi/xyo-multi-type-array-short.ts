/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 12:41:29 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-multi-type-array-short.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 30th August 2018 12:43:01 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoMultiTypeArrayBase } from './xyo-multi-type-array-base';
import { XyoArrayCreator } from '../xyo-array-base';
import { XyoResult } from '../../xyo-result';
import { XyoArrayUnpacker } from '../xyo-array-unpacker';
import { XyoObject } from '../../xyo-object';

class XyoMultiTypeArrayShortCreator extends XyoArrayCreator {

  get minor () {
    return 0x05;
  }

  get sizeOfBytesToGetSize () {
    return 2;
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(buffer.readUInt16BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, false, 2);
    const unpackedArrayObject = new XyoMultiTypeArrayShort(unpackedArray.array);
    return XyoResult.withValue(unpackedArrayObject);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoMultiTypeArrayShort extends XyoMultiTypeArrayBase {

  public static enable () {
    XyoMultiTypeArrayShort.enable();
  }

  public static major () {
    return XyoMultiTypeArrayShort.creator.major;
  }

  public static minor () {
    return XyoMultiTypeArrayShort.creator.minor;
  }

  private static creator = new XyoMultiTypeArrayShortCreator();

  constructor (public readonly array: XyoObject[]) {
    super();
  }

  get id () {
    return XyoResult.withValue(Buffer.from([
      XyoMultiTypeArrayShort.creator.major,
      XyoMultiTypeArrayShort.creator.minor
    ]));
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(
      XyoMultiTypeArrayShort.creator.sizeOfBytesToGetSize
    );
  }
}
