
export class XyoChoicePacket {
  private data: Buffer

  constructor(data: Buffer) {
    this.data = data
  }

  public getChoice(): Buffer {
    const sizeOfChoice = this.getSizeOfChoice()

    if (sizeOfChoice + 1 > this.data.length) {
      throw new Error('getChoice: Out of index')
    }

    return this.data.slice(1, sizeOfChoice + 1)
  }

  public getResponse(): Buffer {
    const sizeOfChoice = this.getSizeOfChoice()

    if (sizeOfChoice + 1 > this.data.length) {
      throw new Error('getResponse: Out of index')
    }

    return this.data.slice(1 + sizeOfChoice)
  }

  private getSizeOfChoice(): number {
    if (this.data.length === 0) {
      throw new Error('getSizeOfChoice: Out of index')
    }

    return this.data.readUInt8(0)
  }

}
