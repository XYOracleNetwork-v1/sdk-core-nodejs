/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 9:53:10 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-uncompressed-ec-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 10:28:38 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../xyo-object';
import { XyoResult } from '../../../xyo-result';
import { XyoObjectCreator } from '../../../xyo-object-creator';

export class XyoUncompressedEcPublicKeyCreator extends XyoObjectCreator {

  constructor(public readonly minor: number) {
    super();
  }

  get major() {
    return 0x04;
  }

  get sizeOfBytesToGetSize() {
    return XyoResult.withValue(0);
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(64);
  }

  public createFromPacked(buffer: Buffer) {
    return XyoResult.withValue(new XyoUncompressedEcPublicKey(
      Buffer.from(buffer, 0, 32),
      Buffer.from(buffer, 32, 32),
      Buffer.from([this.major, this.minor])
    ));
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoUncompressedEcPublicKey extends XyoObject {

  constructor(
    public readonly x: Buffer,
    public readonly y: Buffer,
    public readonly rawId: Buffer
  ) {
    super();
  }

  get data () {
    return XyoResult.withValue(this.getEncoded());
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(null);
  }

  get id () {
    return XyoResult.withValue(this.rawId);
  }

  public getEncoded() {
    return Buffer.concat([
      this.get32ByteEcPoint(this.x),
      this.get32ByteEcPoint(this.y)
    ]);
  }

  private get32ByteEcPoint(point: Buffer) {
    if (point.length === 32) {
      return point;
    }

    return Buffer.from(point, 1, 32);
  }
}
