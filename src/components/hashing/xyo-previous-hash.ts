/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 10:38:56 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 10:53:56 am
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
    return 0x01;
  }

  get sizeOfBytesToGetSize () {
    return XyoResult.withValue(8);
  }

  public readSize(buffer: Buffer) {
    const hashCreator = XyoObjectCreator.getCreator(buffer[0], buffer[1]);
    if (hashCreator === null) { // TODO revisit once getCreator is wrapped in XyoResult
      throw new Error();
    }

    const sizeToRead = hashCreator.sizeOfBytesToGetSize;
    if (sizeToRead.hasError()) {
      return XyoResult.withError(sizeToRead.error!) as XyoResult<number>;
    }

    return hashCreator.readSize(Buffer.from(buffer, 2, sizeToRead.value!));
  }

  public createFromPacked(buffer: Buffer) {
    const hashCreated = XyoObjectCreator.create(buffer); // TODO revisit once create is wrapped in XyoResult
    return XyoResult.withValue(hashCreated as XyoHash);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoPreviousHash extends XyoObject {

  public static enable() {
    return XyoPreviousHash.creator.enable();
  }

  public static major() {
    return XyoPreviousHash.creator.major;
  }

  public static minor() {
    return XyoPreviousHash.creator.minor;
  }

  private static creator = new XyoPreviousHashObjectCreator();

  constructor (private readonly hash: XyoHash) {
    super();
  }

  get data() {
    return this.hash.typed;
  }

  get id () {
    return XyoResult.withValue(Buffer.from([
      XyoPreviousHash.major,
      XyoPreviousHash.minor
    ]));
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(null);
  }
}
