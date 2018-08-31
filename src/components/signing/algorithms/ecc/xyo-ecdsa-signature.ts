/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 9:41:12 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 9:51:43 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSignature } from '../../xyo-signature';
import { XyoResult } from '../../../xyo-result';
import { XyoObjectCreator } from '../../../xyo-object-creator';

export class XyoEcdsaSignatureCreator extends XyoObjectCreator {

  constructor(public readonly minor: number) {
    super();
  }

  get major () {
    return 0x05;
  }

  get sizeOfBytesToGetSize() {
    return XyoResult.withValue(1);
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(buffer.readUInt8(0));
  }

  public createFromPacked(buffer: Buffer) {
    const size = buffer.readUInt8(0);

    return XyoResult.withValue(
      new XyoEcdsaSignature(
        Buffer.from(buffer, 1, size - 1),
        Buffer.from([this.major, this.minor])
      )
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoEcdsaSignature extends XyoSignature {

  constructor(
    private readonly signature: Buffer,
    private readonly rawId: Buffer
  ) {
    super();
  }

  get data() {
    return XyoResult.withValue(this.signature);
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(1);
  }

  get encodedSignature () {
    return this.signature;
  }

  get id () {
    return XyoResult.withValue(this.rawId);
  }
}
