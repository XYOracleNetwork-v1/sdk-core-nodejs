/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 12:18:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-byte.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 3:00:30 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSingleTypeArrayBase } from '../single/xyo-single-type-array-base';
import { XyoObject } from '../../xyo-object';
import { XyoArrayCreator } from '../xyo-array-base';
import { XyoResult } from '../../xyo-result';
import { XyoArrayUnpacker } from '../xyo-array-unpacker';

class XyoSingleTypeArrayByteCreator extends XyoArrayCreator {

  get sizeOfBytesToGetSize () {
    return XyoResult.withValue(1);
  }

  get minor () {
    return 0x01;
  }

  public readSize(buffer: Buffer): XyoResult<number | null> {
    return XyoResult.withValue(buffer.readUInt8(0));
  }

  public createFromPacked(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, true, 1);
    const unpackedArrayObject = new XyoSingleTypeArrayByte(
      unpackedArray.majorType!,
      unpackedArray.majorType!,
      unpackedArray.array
    );

    return XyoResult.withValue(unpackedArrayObject);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoSingleTypeArrayByte extends XyoSingleTypeArrayBase {

  public static creator = new XyoSingleTypeArrayByteCreator();

  get id () {
    return XyoSingleTypeArrayByte.creator.id;
  }

  constructor(
    public readonly elementMajor: number,
    public readonly elementMinor: number,
    public readonly array: XyoObject[]
  ) {
    super();
  }

  get sizeIdentifierSize() {
    return XyoSingleTypeArrayByte.creator.sizeOfBytesToGetSize;
  }

  get typedId () {
    return Buffer.from([
      this.elementMajor,
      this.elementMinor
    ]);
  }
}
