/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 12:45:24 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 2:45:42 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoResult } from './xyo-result';
import { XyoError } from './xyo-error';
export abstract class XyoObject {
  public abstract data: XyoResult<Buffer>;
  public abstract sizeIdentifierSize: number | null;
  public abstract id: Buffer;

  get typed() {
    return this.makeTyped();
  }

  get unTyped() {
    return this.makeUntyped();
  }

  get totalSize() {
    if (this.data.result) {
      return this.data.result.length;
    }

    return 0;
  }

  get encodedSize() {
    if (this.sizeIdentifierSize === null) {
      return new Buffer(0);
    }

    const buffer = new Buffer(this.sizeIdentifierSize);
    buffer.writeUInt32BE(this.totalSize + this.sizeIdentifierSize, 0);
    return buffer;
  }

  private makeTyped() {
    const encodedSizeBuffer = this.encodedSize;
    const dataBuffer = this.data.result || new Buffer(0);

    const typedBufferSize = this.id.length + encodedSizeBuffer.length + dataBuffer.length;

    const typedBuffer = Buffer.concat([
      this.id,
      encodedSizeBuffer,
      dataBuffer
    ], typedBufferSize);

    return typedBuffer;
  }

  private makeUntyped() {
    const encodedSizeBuffer = this.encodedSize;
    const dataBuffer = this.data.result || new Buffer(0);
    const typedBufferSize = encodedSizeBuffer.length + dataBuffer.length;

    const unTypedBuffer = Buffer.concat([
      encodedSizeBuffer,
      dataBuffer
    ], typedBufferSize);

    return unTypedBuffer;
  }
}
