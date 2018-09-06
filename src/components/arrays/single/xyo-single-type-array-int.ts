/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 10:24:15 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-int.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 5th September 2018 9:35:40 am
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
    return XyoResult.withValue(4);
  }

  get minor () {
    return 0x03;
  }

  public readSize(buffer: Buffer): XyoResult<number | null> {
    return XyoResult.withValue(buffer.readUInt32BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, true, 4);
    const arrayResult = unpackedArray.array;
    if (arrayResult.hasError()) {
      return XyoResult.withError(arrayResult.error!) as XyoResult<XyoSingleTypeArrayInt>;
    }
    const unpackedArrayObject = new XyoSingleTypeArrayInt(
      unpackedArray.majorType!,
      unpackedArray.majorType!,
      arrayResult.value!
    );

    return XyoResult.withValue(unpackedArrayObject);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoSingleTypeArrayInt extends XyoSingleTypeArrayBase {

  public static creator = new XyoSingleTypeArrayIntCreator();

  get id () {
    return XyoSingleTypeArrayInt.creator.id;
  }

  constructor(
    public readonly elementMajor: number,
    public readonly elementMinor: number,
    public readonly array: XyoObject[]
  ) {
    super();
  }

  get sizeIdentifierSize() {
    return XyoSingleTypeArrayInt.creator.sizeOfBytesToGetSize;
  }

  get typedId () {
    return Buffer.from([
      this.elementMajor,
      this.elementMinor
    ]);
  }
}
