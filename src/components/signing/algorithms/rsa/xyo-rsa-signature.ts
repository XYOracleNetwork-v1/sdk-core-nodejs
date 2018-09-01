/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 4:37:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 6th September 2018 9:29:31 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSignature } from '../../xyo-signature';
import { XyoResult } from '../../../xyo-result';
import { XyoObjectCreator } from '../../../xyo-object-creator';

export class XyoRsaSignatureCreator extends XyoObjectCreator {

  constructor(public readonly minor: number) {
    super();
  }

  get major () {
    return 0x05;
  }

  get sizeOfBytesToGetSize() {
    return XyoResult.withValue(2);
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(buffer.readUInt16BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    return XyoResult.withValue(new XyoRsaSignature(
      buffer.slice(2),
      Buffer.from([this.major, this.minor])
    ));
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoRsaSignature extends XyoSignature {

  constructor (
    private readonly rawSignature: Buffer,
    public readonly rawId: Buffer
  ) {
    super();
  }

  get data() {
    return XyoResult.withValue(this.rawSignature);
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(2);
  }

  get encodedSignature () {
    return this.rawSignature;
  }

  get id () {
    return XyoResult.withValue(this.rawId);
  }
}
