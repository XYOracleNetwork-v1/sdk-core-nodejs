// eslint-disable-next-line import/no-cycle
import { XyoIterableStructure } from './xyo-iterable-structure'
import { XyoStructure } from './xyo-structure'

export class XyoIterator implements Iterator<XyoStructure> {
  private offset: number
  private structure: XyoIterableStructure
  private isTyped: boolean

  constructor(
    offset: number,
    structure: XyoIterableStructure,
    isTyped: boolean
  ) {
    this.offset = offset
    this.structure = structure
    this.isTyped = isTyped
  }

  public next(): IteratorResult<XyoStructure> {
    const nextItem = this.structure.readItemAtOffset(this.offset)

    if (this.isTyped) {
      this.offset += nextItem.getAll().getSize() - 2
    } else {
      this.offset += nextItem.getAll().getSize()
    }

    const result: IteratorResult<XyoStructure> = {
      done: this.hasNext(),
      value: nextItem,
    }

    return result
  }

  public hasNext(): boolean {
    return this.structure.getAll().getSize() > this.offset
  }
}
