/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { XyoStructure } from './xyo-structure'
import { XyoSchema } from './xyo-schema'
import { XyoBuffer } from './xyo-buffer'
import { XyoIterator } from './xyo-iterator'

export class XyoIterableStructure extends XyoStructure {
  public static validate(structure: XyoIterableStructure) {
    const it = structure.newIterator()

    try {
      while (it.hasNext()) {
        const item = it.next().value

        if (item instanceof XyoIterableStructure) {
          if (!XyoIterableStructure.validate(item)) {
            return false
          }
        }
      }
      return true
    } catch (error) {
      return false
    }
  }

  public static toJson(structure: XyoStructure): any[] {
    const toReturn: any[] = []

    if (structure instanceof XyoIterableStructure) {
      const it = structure.newIterator()

      while (it.hasNext()) {
        const item = it.next().value
        const childArray = XyoIterableStructure.toJson(item)
        toReturn.push(childArray)
      }
    } else {
      toReturn.push(
        structure
          .getAll()
          .getContentsCopy()
          .toString('hex')
      )
    }

    return toReturn
  }

  public static newIterable(
    schema: XyoSchema,
    items: XyoStructure[]
  ): XyoIterableStructure {
    if (!schema.getIsIterable()) {
      throw new Error('Can not make iterable object from not iterable schema')
    }

    if (schema.getIsTypedIterable()) {
      const typedBuffer = XyoIterableStructure.encodeTyped(schema, items)
      return new XyoIterableStructure(
        XyoStructure.encode(schema, new XyoBuffer(typedBuffer))
      )
    }

    const untypedBuffer = XyoIterableStructure.encodeUntyped(schema, items)
    return new XyoIterableStructure(
      XyoStructure.encode(schema, new XyoBuffer(untypedBuffer))
    )
  }

  private static encodeUntyped(
    schema: XyoSchema,
    items: XyoStructure[]
  ): Buffer {
    const buffersToMerge: Buffer[] = []

    for (const item of items) {
      buffersToMerge.push(item.getAll().getContentsCopy())
    }

    return Buffer.concat(buffersToMerge)
  }

  private static encodeTyped(schema: XyoSchema, items: XyoStructure[]): Buffer {
    const buffersToMerge: Buffer[] = []

    if (items.length < 1) {
      return Buffer.alloc(0)
    }

    const headerBuffer = Buffer.alloc(2)
    headerBuffer.writeUInt8(items[0].getSchema().encodingCatalogue, 0)
    headerBuffer.writeUInt8(items[0].getSchema().id, 1)
    buffersToMerge.push(headerBuffer)

    for (const item of items) {
      buffersToMerge.push(
        item
          .getAll()
          .getContentsCopy()
          .slice(2)
      )
    }

    return Buffer.concat(buffersToMerge)
  }

  private typedSchema: XyoSchema | undefined

  public newIterator(): XyoIterator {
    return new XyoIterator(
      this.readOwnHeader(),
      this,
      this.typedSchema !== undefined
    )
  }

  public getCount(): number {
    const it = this.newIterator()
    let i = 0

    while (it.hasNext()) {
      it.next()
      i++
    }

    return i
  }

  public get(index: number): XyoStructure {
    const it = this.newIterator()
    let i = 0

    while (it.hasNext()) {
      const item = it.next()

      if (index === i) {
        return item.value
      }

      i++
    }

    throw new Error(`Out of index ${index}`)
  }

  public getId(id: number): XyoStructure[] {
    const itemsOfThatId: XyoStructure[] = []
    const it = this.newIterator()

    while (it.hasNext()) {
      const item = it.next().value

      if (item.getSchema().id === id) {
        itemsOfThatId.push(item)
      }
    }

    return itemsOfThatId
  }

  public readItemAtOffset(offset: number) {
    if (this.typedSchema) {
      return this.readItemTyped(offset, this.typedSchema)
    }

    return this.readItemUntyped(offset)
  }

  protected addElement(element: XyoStructure) {
    this.readOwnHeader()

    if (element.getSchema().getIsTypedIterable() && this.typedSchema) {
      if (element.getSchema().id === this.typedSchema.id) {
        const newBufferTyped = Buffer.concat([
          this.getValue().getContentsCopy(),
          element
            .getAll()
            .getContentsCopy()
            .slice(2)
        ])

        this.contents = XyoStructure.encode(
          element.getSchema(),
          new XyoBuffer(newBufferTyped)
        )
        return
      }

      throw new Error('Can not add different type to typed array')
    }

    const newBufferUntyped = Buffer.concat([
      this.getValue().getContentsCopy(),
      element.getAll().getContentsCopy()
    ])

    this.contents = XyoStructure.encode(
      this.getSchema(),
      new XyoBuffer(newBufferUntyped)
    )
  }

  private readItemUntyped(offset: number): XyoStructure {
    const schema = this.readSchema(offset)
    const sizeOfObject = this.readSize(schema.getSizeIdentifier(), offset + 2)

    if (sizeOfObject === 0) {
      throw new Error('Size can not be 0')
    }

    const end = 2 + sizeOfObject + offset
    this.checkIndex(end)

    const objectValue = XyoBuffer.wrap(this.contents, offset, end)

    if (schema.getIsIterable()) {
      return new XyoIterableStructure(objectValue)
    }

    return new XyoStructure(objectValue)
  }

  private readItemTyped(offset: number, schemaOfItem: XyoSchema): XyoStructure {
    const sizeOfObject = this.readSize(schemaOfItem.getSizeIdentifier(), offset)

    if (sizeOfObject === 0) {
      throw new Error('Size can not be 0')
    }

    const end = sizeOfObject + offset
    this.checkIndex(end)

    const objectValue = XyoBuffer.wrap(this.contents, offset, end)

    if (schemaOfItem.getIsIterable()) {
      return new XyoIterableStructure(objectValue, schemaOfItem)
    }

    return new XyoStructure(objectValue, schemaOfItem)
  }

  private readOwnHeader(): number {
    this.checkIndex(2)
    const schema = this.getSchema()

    this.checkIndex(2 + schema.getSizeIdentifier().valueOf() - 1)
    const totalSize = this.readSize(schema.getSizeIdentifier(), 2)

    if (!schema.getIsIterable()) {
      throw new Error('Object is not iterable')
    }

    if (
      schema.getIsTypedIterable() &&
      totalSize !== schema.getSizeIdentifier().valueOf()
    ) {
      this.typedSchema = this.readSchema(
        schema.getSizeIdentifier().valueOf() + 2
      )
      return 4 + schema.getSizeIdentifier().valueOf()
    }

    return 2 + schema.getSizeIdentifier().valueOf()
  }
}
