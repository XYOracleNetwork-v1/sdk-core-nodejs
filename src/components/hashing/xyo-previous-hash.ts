/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 10:38:56 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 6th September 2018 10:13:05 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoHash } from './xyo-hash';
import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoResult } from '../xyo-result';

export class XyoPreviousHashObjectCreator extends XyoObjectCreator {

  get major () {
    return 0x02;
  }

  get minor () {
    return 0x06;
  }

  get sizeOfBytesToGetSize () {
    return XyoResult.withValue(8);
  }

  public readSize(buffer: Buffer) {
    const hashCreator = XyoObjectCreator.getCreator(buffer[0], buffer[1]);
    if (hashCreator.hasError()) {
      return XyoResult.withError(hashCreator.error!) as XyoResult<number>;
    }

    const sizeToRead = hashCreator.value!.sizeOfBytesToGetSize;
    if (sizeToRead.hasError()) {
      return XyoResult.withError(sizeToRead.error!) as XyoResult<number>;
    }

    return hashCreator.value!.readSize(buffer.slice(2, 2 + sizeToRead.value!));
  }

  public createFromPacked(buffer: Buffer) {
    const hashCreated = XyoObjectCreator.create(buffer);
    return XyoResult.withValue(hashCreated.value as XyoHash);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoPreviousHash extends XyoObject {

  public static creator = new XyoPreviousHashObjectCreator();

  constructor (private readonly hash: XyoHash) {
    super();
  }

  get data() {
    return this.hash.typed;
  }

  get id () {
    return XyoPreviousHash.creator.id;
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(null);
  }
}
