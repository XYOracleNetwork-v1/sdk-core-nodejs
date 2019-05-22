import { XyoSize } from './xyo-size'

export class XyoSchema {

  public static create (id: number, isIterable: boolean, isTyped: boolean, sizeIdentifier: XyoSize): XyoSchema {
    const iterableByte = XyoSchema.getIterableByte(isIterable)
    const getTypedByte = XyoSchema.getTypedByte(isTyped)
    const getSizeByte = XyoSchema.getSizeByte(sizeIdentifier)
    const encodingCatalogue = iterableByte | getTypedByte | getSizeByte

    return new XyoSchema(id, encodingCatalogue)
  }

  private static getIterableByte (isIterable: boolean): number {
    if (isIterable) {
      return 0x20
    }

    return 0x00
  }

  private static getTypedByte (isTyped: boolean): number {
    if (isTyped) {
      return 0x10
    }

    return 0x00
  }

  private static getSizeByte (size: XyoSize): number {
    switch (size) {
      case XyoSize.ONE: return 0x00
      case XyoSize.TWO: return 0x40
      case XyoSize.FOUR: return 0x80
      case XyoSize.EIGHT: return 0xc0
    }
  }

  public id: number
  public encodingCatalogue: number

  constructor(id: number, encodingCatalogue: number) {
    this.id = id
    this.encodingCatalogue = encodingCatalogue
  }

  public getSizeIdentifier (): XyoSize {
    if ((this.encodingCatalogue & 0xc0) === 0x00) {
      return XyoSize.ONE
    }

    if ((this.encodingCatalogue & 0xc0) === 0x40) {
      return XyoSize.TWO
    }

    if ((this.encodingCatalogue & 0xc0) === 0x80) {
      return XyoSize.FOUR
    }

    return XyoSize.EIGHT
  }

  public getIsIterable (): boolean {
    return (this.encodingCatalogue & 0x20) !== 0
  }

  public getIsTypedIterable (): boolean {
    return (this.encodingCatalogue & 0x10) !== 0
  }
}
