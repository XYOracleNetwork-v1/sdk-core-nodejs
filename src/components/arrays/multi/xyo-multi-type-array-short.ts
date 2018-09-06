/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 12:41:29 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-multi-type-array-short.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 5th September 2018 9:34:20 am
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
    return XyoResult.withValue(2);
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(buffer.readUInt16BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, false, 2);
    const arrayResult = unpackedArray.array;
    if (arrayResult.hasError()) {
      return XyoResult.withError(arrayResult.error!) as XyoResult<XyoMultiTypeArrayShort>;
    }
    const unpackedArrayObject = new XyoMultiTypeArrayShort(arrayResult.value!);
    return XyoResult.withValue(unpackedArrayObject);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoMultiTypeArrayShort extends XyoMultiTypeArrayBase {

  public static creator = new XyoMultiTypeArrayShortCreator();

  constructor (public readonly array: XyoObject[]) {
    super();
  }

  get id () {
    return XyoMultiTypeArrayShort.creator.id;
  }

  get sizeIdentifierSize () {
    return XyoMultiTypeArrayShort.creator.sizeOfBytesToGetSize;
  }
}
