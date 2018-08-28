/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 9:39:11 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-basic-hash-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:53:40 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash, XyoHashCreator } from './xyo-hash';
import crypto from 'crypto';
import { XyoByteArrayReader } from '../xyo-byte-array-reader';

export abstract class XyoBasicHashBase extends XyoHash {

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
export class XyoBasicHashBaseCreator extends XyoHashCreator {

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

  public createHash(data: Buffer): XyoHash {
    return new XyoBasicHashBaseImpl(
      this.hash(data),
      Buffer.from([this.major, this.minor])
    );
  }

  public hash(data: Buffer): Buffer {
    const hasher = crypto.createHash(this.standardDigestKey);
    hasher.update(data);
    return hasher.digest();
  }

  public createFromPacked(byteArray: Buffer): XyoHash {
    const hash = new XyoByteArrayReader(byteArray).read(2, byteArray.length - 2);
    return new XyoBasicHashBaseImpl(hash, Buffer.from([byteArray[0], byteArray[1]]));
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoBasicHashBaseImpl extends XyoBasicHashBase {
  constructor(pastHash: Buffer, public readonly id: Buffer) {
    super(pastHash);
  }
}
