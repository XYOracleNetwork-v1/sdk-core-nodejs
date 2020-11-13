export class XyoBuffer {
  public static wrap(
    buffer: XyoBuffer,
    startOffset: number,
    endOffset: number
  ): XyoBuffer {
    return new XyoBuffer(
      buffer.rootBuffer,
      startOffset + buffer.startOffset,
      endOffset + buffer.startOffset
    )
  }

  public startOffset: number
  public endOffset: number
  public rootBuffer: Buffer

  constructor(buffer: Buffer, startOffset?: number, endOffset?: number) {
    this.rootBuffer = buffer
    this.startOffset = startOffset || 0
    this.endOffset = endOffset || buffer.length
  }

  public getSize(): number {
    return this.endOffset - this.startOffset
  }

  public getUInt8(offset: number) {
    return this.rootBuffer.readUInt8(this.startOffset + offset)
  }

  public getUInt16BE(offset: number) {
    return this.rootBuffer.readUInt16BE(this.startOffset + offset)
  }

  public getUInt32BE(offset: number) {
    return this.rootBuffer.readUInt32BE(this.startOffset + offset)
  }

  public getUInt64BE(offset: number) {
    // todo find way to get the int64 size, this will get all the way up to a 2^32 as a size
    return this.rootBuffer.readUInt32BE(this.startOffset + offset + 4)
  }

  public getContentsCopy(): Buffer {
    return this.rootBuffer.slice(this.startOffset, this.endOffset)
  }

  public copyRangeOf(from: number, to: number): XyoBuffer {
    return XyoBuffer.wrap(this, from, to)
  }
}
