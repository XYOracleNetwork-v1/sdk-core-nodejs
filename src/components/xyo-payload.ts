/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 3:00:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-payload.ts
 * @Last modified by:
 * @Last modified time:
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from './xyo-object';
import { XyoMultiTypeArrayInt } from './arrays/multi/xyo-multi-type-array-int';
import { XyoObjectCreator } from './xyo-object-creator';
import { XyoResult } from './xyo-result';
import { XyoByteArraySetter } from './xyo-byte-array-setter';

class XyoPayloadObjectCreator extends XyoObjectCreator {

  get major () {
    return 0x02;
  }

  get minor () {
    return 0x04;
  }

  get sizeOfBytesToGetSize() {
    return XyoResult.withValue(4);
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(buffer.readUInt32BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    const signedPayloadSize = buffer.readUInt32BE(4);
    const unsignedPayloadSize = buffer.readUInt32BE(4 + signedPayloadSize);
    const signedPayload = Buffer.from(buffer, 4, signedPayloadSize);
    const unsignedPayload = Buffer.from(buffer, 4 + signedPayloadSize, unsignedPayloadSize);
    const signedPayloadCreated = XyoMultiTypeArrayInt.createFromPacked(signedPayload);
    const unsignedPayloadCreated = XyoMultiTypeArrayInt.createFromPacked(unsignedPayload);
    return XyoResult.withValue(new XyoPayload(signedPayloadCreated.value!, unsignedPayloadCreated.value!));
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoPayload extends XyoObject {

  public static enable() {
    return XyoPayload.creator.enable();
  }

  public static major() {
    return XyoPayload.creator.major;
  }

  public static minor() {
    return XyoPayload.creator.minor;
  }

  private static creator = new XyoPayloadObjectCreator();

  constructor(
    public readonly signedPayload: XyoMultiTypeArrayInt,
    public readonly unsignedPayload: XyoMultiTypeArrayInt
  ) {
    super();
  }

  get data () {
    return this.makeEncoded();
  }

  get id () {
    return XyoResult.withValue(Buffer.from([
      XyoPayload.major,
      XyoPayload.minor,
    ]));
  }

  get sizeIdentifierSize () {
    return XyoResult.withValue(4);
  }

  private makeEncoded() {
    const signedPayloadUntyped = this.signedPayload.unTyped;
    const unsignedPayloadUntyped = this.unsignedPayload.unTyped;

    if (signedPayloadUntyped.hasError() || unsignedPayloadUntyped.hasError()) {
      return XyoResult.withError(
        (signedPayloadUntyped.error || unsignedPayloadUntyped.error)!
      ) as XyoResult<Buffer>;
    }
    const merger = new XyoByteArraySetter();
    merger.add(signedPayloadUntyped.value!, 0);
    merger.add(unsignedPayloadUntyped.value!, 1);

    return XyoResult.withValue(merger.merge());
  }
}