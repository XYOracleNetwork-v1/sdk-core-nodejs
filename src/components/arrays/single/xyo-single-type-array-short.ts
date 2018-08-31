/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 12:24:23 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-short.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 1:33:35 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSingleTypeArrayBase } from '../single/xyo-single-type-array-base';
import { XyoObject } from '../../xyo-object';
import { XyoArrayCreator } from '../xyo-array-base';
import { XyoResult } from '../../xyo-result';
import { XyoArrayUnpacker } from '../xyo-array-unpacker';

class XyoSingleTypeArrayShortCreator extends XyoArrayCreator {

  get sizeOfBytesToGetSize () {
    return XyoResult.withValue(2);
  }

  get minor () {
    return 0x02;
  }

  public readSize(buffer: Buffer): XyoResult<number | null> {
    return XyoResult.withValue(buffer.readUInt16BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, true, 2);
    const unpackedArrayObject = new XyoSingleTypeArrayShort(
      unpackedArray.majorType!,
      unpackedArray.majorType!,
      unpackedArray.array
    );

    return XyoResult.withValue(unpackedArrayObject);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoSingleTypeArrayShort extends XyoSingleTypeArrayBase {

  public static creator = new XyoSingleTypeArrayShortCreator();

  get id () {
    return XyoResult.withValue(Buffer.from([
      XyoSingleTypeArrayShort.creator.major,
      XyoSingleTypeArrayShort.creator.minor
    ]));
  }

  constructor(
    public readonly elementMajor: number,
    public readonly elementMinor: number,
    public readonly array: XyoObject[]
  ) {
    super();
  }

  get sizeIdentifierSize() {
    return XyoSingleTypeArrayShort.creator.sizeOfBytesToGetSize;
  }

  get typedId () {
    return Buffer.from([
      this.elementMajor,
      this.elementMinor
    ]);
  }
}
