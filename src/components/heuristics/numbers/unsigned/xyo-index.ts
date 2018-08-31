/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 1:35:37 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 1:39:00 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNumberUnsigned } from './xyo-number-unsigned';
import { XyoObjectCreator } from '../../../xyo-object-creator';
import { XyoResult } from '../../../xyo-result';
import { XyoNumberType } from '../xyo-number-type';

class XyoIndexCreator extends XyoObjectCreator {

  get major () {
    return 0x02;
  }

  get minor () {
    return 0x04;
  }

  get sizeOfBytesToGetSize () {
    return XyoResult.withValue(0);
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(4);
  }

  public createFromPacked(buffer: Buffer) {
    return XyoResult.withValue(new XyoIndex(buffer.readUInt32BE(0)));
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoIndex extends XyoNumberUnsigned {

  public static creator = new XyoIndexCreator();

  constructor (public readonly number: number) {
    super();
  }

  get size() {
    return XyoNumberType.INT;
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(null);
  }

  get id () {
    return XyoResult.withValue(Buffer.from([
      XyoIndex.creator.major,
      XyoIndex.creator.minor
    ]));
  }
}
