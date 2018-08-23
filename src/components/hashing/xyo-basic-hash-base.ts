/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 9:39:11 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-basic-hash-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 23rd August 2018 10:33:29 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOHash, XYOHashCreator } from './xyo-hash';
import crypto from 'crypto';
import { XYOByteArrayReader } from '../xyo-byte-array-reader';

export abstract class XYOBasicHashBase extends XYOHash {

  private readonly mHash: Buffer;

  constructor(pastHash: Buffer) {
    super();
    this.mHash = pastHash;
  }

  get hash () {
    return this.mHash;
  }

  get sizeIdentifierSize () {
    return null;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XYOBasicHashBaseCreator extends XYOHashCreator {

  constructor(
    public readonly standardDigestKey: string,
    public readonly defaultSize: number,
    public readonly minor: number
  ) {
    super();
  }

  get sizeOfSize () {
    return null;
  }

  public createHash(data: Buffer): XYOHash {
    return new XYOBasicHashBaseImpl(
      this.hash(data),
      Buffer.from([this.major, this.minor])
    );
  }

  public hash(data: Buffer): Buffer {
    const hasher = crypto.createHash(this.standardDigestKey);
    hasher.update(data);
    return hasher.digest();
  }

  public createFromPacked(byteArray: Buffer): XYOHash {
    const hash = new XYOByteArrayReader(byteArray).read(2, byteArray.length - 2);
    return new XYOBasicHashBaseImpl(hash, Buffer.from([byteArray[0], byteArray[1]]));
  }
}

// tslint:disable-next-line:max-classes-per-file
class XYOBasicHashBaseImpl extends XYOBasicHashBase {
  constructor(pastHash: Buffer, public readonly id: Buffer) {
    super(pastHash);
  }
}
