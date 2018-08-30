/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 10:24:15 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-int.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 30th August 2018 12:22:48 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSingleTypeArrayBase } from '../single/xyo-single-type-array-base';
import { XyoObject } from '../../xyo-object';
import { XyoArrayCreator } from '../xyo-array-base';
import { XyoResult } from '../../xyo-result';
import { XyoArrayUnpacker } from '../xyo-array-unpacker';

class XyoSingleTypeArrayIntCreator extends XyoArrayCreator {

  get sizeOfBytesToGetSize () {
    return 4;
  }

  get minor () {
    return 0x03;
  }

  public readSize(buffer: Buffer): XyoResult<number | null> {
    return XyoResult.withValue(buffer.readUInt32BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, true, 4);
    const unpackedArrayObject = new XyoSingleTypeArrayInt(
      unpackedArray.majorType!,
      unpackedArray.majorType!,
      unpackedArray.array
    );

    return XyoResult.withValue(unpackedArrayObject);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoSingleTypeArrayInt extends XyoSingleTypeArrayBase {

  public static enable () {
    XyoSingleTypeArrayInt.enable();
  }

  public static major () {
    return XyoSingleTypeArrayInt.creator.major;
  }

  public static minor () {
    return XyoSingleTypeArrayInt.creator.minor;
  }

  private static creator = new XyoSingleTypeArrayIntCreator();

  get id () {
    return XyoResult.withValue(Buffer.from([XyoSingleTypeArrayInt.creator.major, XyoSingleTypeArrayInt.creator.minor]));
  }

  constructor(
    public readonly elementMajor: number,
    public readonly elementMinor: number,
    public readonly array: XyoObject[]
  ) {
    super();
  }

  get sizeIdentifierSize() {
    return XyoResult.withValue(XyoSingleTypeArrayInt.creator.sizeOfBytesToGetSize);
  }

  get typedId () {
    return Buffer.from([
      this.elementMajor,
      this.elementMinor
    ]);
  }
}
