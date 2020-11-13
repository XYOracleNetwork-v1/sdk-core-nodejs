import { XyoSizeUtil } from './size-util'
import { XyoBuffer } from './xyo-buffer'
import { XyoSchema } from './xyo-schema'
import { XyoSize } from './xyo-size'

export class XyoStructure {
  public static encode(schema: XyoSchema, value: XyoBuffer): XyoBuffer {
    const bestSize = XyoSizeUtil.getBestSize(value.getSize())
    const header = Buffer.alloc(2 + bestSize.valueOf())
    const size = value.getSize() + bestSize.valueOf()
    const optimizedSchema = XyoSchema.create(
      schema.id,
      schema.getIsIterable(),
      schema.getIsTypedIterable(),
      bestSize
    )

    header.writeUInt8(optimizedSchema.encodingCatalogue, 0)
    header.writeUInt8(schema.id, 1)

    switch (bestSize) {
      case XyoSize.ONE:
        header.writeUInt8(size, 2)
        break
      case XyoSize.TWO:
        header.writeUInt16BE(size, 2)
        break
      case XyoSize.FOUR:
        header.writeUInt32BE(size, 2)
        break
      case XyoSize.EIGHT:
        header.writeUIntBE(size, 2, 8)
        break
    }

    const encoded = Buffer.concat([header, value.getContentsCopy()])
    return new XyoBuffer(encoded)
  }

  public static newInstance(schema: XyoSchema, value: XyoBuffer) {
    return new XyoStructure(XyoStructure.encode(schema, value))
  }

  protected contents: XyoBuffer
  private overrideSchema: XyoSchema | undefined

  constructor(contents: XyoBuffer | Buffer, overrideSchema?: XyoSchema) {
    this.contents =
      contents instanceof Buffer
        ? (this.contents = new XyoBuffer(contents))
        : contents

    this.overrideSchema = overrideSchema
  }

  public getSchema(): XyoSchema {
    if (this.overrideSchema) {
      return this.overrideSchema
    }

    return this.readSchema(0)
  }

  public getValue(): XyoBuffer {
    if (this.overrideSchema) {
      const schema = this.getSchema()
      const startOffset = schema.getSizeIdentifier().valueOf()
      const endOffset = this.readSize(schema.getSizeIdentifier(), 0)
      return this.contents.copyRangeOf(startOffset, endOffset)
    }

    const schema = this.getSchema()
    const startOffset = schema.getSizeIdentifier().valueOf() + 2
    const endOffset = this.readSize(schema.getSizeIdentifier(), 2) + 2

    return this.contents.copyRangeOf(startOffset, endOffset)
  }

  public getAll(): XyoBuffer {
    if (this.overrideSchema) {
      const headerBuffer = Buffer.alloc(2)
      headerBuffer.writeUInt8(this.overrideSchema.encodingCatalogue, 0)
      headerBuffer.writeUInt8(this.overrideSchema.id, 1)
      const together = Buffer.concat([
        headerBuffer,
        this.contents.getContentsCopy(),
      ])

      return new XyoBuffer(together)
    }

    return this.contents
  }

  protected readSchema(offset: number): XyoSchema {
    this.checkIndex(offset + 2)

    const id = this.contents.getUInt8(1 + offset)
    const encodingCatalogue = this.contents.getUInt8(offset)

    return new XyoSchema(id, encodingCatalogue)
  }

  protected checkIndex(index: number) {
    if (index > this.contents.getSize()) {
      throw new Error(`Out of count ${index}`)
    }
  }

  protected readSize(size: XyoSize, offset: number): number {
    switch (size) {
      case XyoSize.ONE:
        return this.contents.getUInt8(offset)
      case XyoSize.TWO:
        return this.contents.getUInt16BE(offset)
      case XyoSize.FOUR:
        return this.contents.getUInt32BE(offset)
      case XyoSize.EIGHT:
        return this.contents.getUInt64BE(offset)
    }
  }
}
