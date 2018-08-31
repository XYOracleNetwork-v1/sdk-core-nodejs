/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 5:02:15 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-public-key.ts
 * @Last modified by:
 * @Last modified time:
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../xyo-object';
import { XyoResult } from '../../../xyo-result';
import { XyoObjectCreator } from '../../../xyo-object-creator';

class XyoRsaPublicKeyCreator extends XyoObjectCreator {

  get major () {
    return 0x04;
  }

  get minor () {
    return 0x03;
  }

  get sizeOfBytesToGetSize() {
    return XyoResult.withValue(2);
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(buffer.readUInt16BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    const modulusSize = buffer.readUInt16BE(0) - 2;
    const mod = Buffer.from(buffer, 0, modulusSize);
    return XyoResult.withValue(new XyoRsaPublicKey(mod));
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoRsaPublicKey extends XyoObject {

  public static enable() {
    return XyoRsaPublicKey.creator.enable();
  }

  public static major() {
    return XyoRsaPublicKey.creator.major;
  }

  public static minor() {
    return XyoRsaPublicKey.creator.minor;
  }

  private static creator = new XyoRsaPublicKeyCreator();

  constructor(public readonly modulus: Buffer) {
    super();
  }

  get data () {
    return XyoResult.withValue(this.modulus);
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(null);
  }

  get publicExponent() {
    return Buffer.from([0x01, 0x00, 0x01]);
  }

  get id () {
    return XyoResult.withValue(Buffer.from([
      XyoRsaPublicKey.major,
      XyoRsaPublicKey.minor
    ]));
  }
}
