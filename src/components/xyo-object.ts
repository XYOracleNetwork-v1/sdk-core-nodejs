/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 12:45:24 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 21st August 2018 1:23:59 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export abstract class XYOObject {
  public abstract data: Buffer;
  public abstract sizeIdentifierSize: number | null;
  public abstract id: number;

  get typed() {
    return this.makeTyped();
  }

  get unTyped() {
    return this.makeUntyped();
  }

  get totalSize() {
    return this.data.length;
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
    const idBuffer = new Buffer(2);
    idBuffer.writeUInt16BE(this.id, 0);

    const encodedSizeBuffer = this.encodedSize;
    const dataBuffer = this.data;
    const typedBufferSize = idBuffer.length + encodedSizeBuffer.length + dataBuffer.length;

    const typedBuffer = Buffer.concat([
      idBuffer,
      encodedSizeBuffer,
      dataBuffer
    ], typedBufferSize);

    return typedBuffer;
  }

  private makeUntyped() {
    const encodedSizeBuffer = this.encodedSize;
    const dataBuffer = this.data;
    const typedBufferSize = encodedSizeBuffer.length + dataBuffer.length;

    const unTypedBuffer = Buffer.concat([
      encodedSizeBuffer,
      dataBuffer
    ], typedBufferSize);

    return unTypedBuffer;
  }
}
