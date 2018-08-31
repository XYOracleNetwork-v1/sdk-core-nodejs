/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 12:45:24 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 4:29:12 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoResult } from './xyo-result';
import { XyoError } from './xyo-error';
export abstract class XyoObject {
  public abstract data: XyoResult<Buffer>;
  public abstract sizeIdentifierSize: XyoResult<number | null>;
  public abstract id: XyoResult<Buffer>;

  get typed() {
    return this.makeTyped();
  }

  get unTyped() {
    return this.makeUntyped();
  }

  get totalSize() {
    if (this.data.value) {
      return this.data.value.length;
    }

    return 0;
  }

  get encodedSize() {
    if (this.sizeIdentifierSize.value === null) {
      return XyoResult.withValue(new Buffer(0));
    }

    const buffer = new Buffer(this.sizeIdentifierSize.value || 0);
    buffer.writeUInt32BE(this.totalSize + (this.sizeIdentifierSize.value || 0), 0);
    return XyoResult.withValue(buffer);
  }

  private makeTyped() {
    const encodedSizeBuffer = this.encodedSize.value!;
    const dataBuffer = this.data.value || new Buffer(0);

    const typedBufferSize = this.id.value!.length + encodedSizeBuffer.length + dataBuffer.length;

    const typedBuffer = Buffer.concat([
      this.id.value!,
      encodedSizeBuffer,
      dataBuffer
    ], typedBufferSize);

    return XyoResult.withValue(typedBuffer);
  }

  private makeUntyped() {
    const encodedSizeBuffer = this.encodedSize.value!;
    const dataBuffer = this.data.value || new Buffer(0);
    const typedBufferSize = encodedSizeBuffer.length + dataBuffer.length;

    const unTypedBuffer = Buffer.concat([
      encodedSizeBuffer,
      dataBuffer
    ], typedBufferSize);

    return XyoResult.withValue(unTypedBuffer);
  }
}
