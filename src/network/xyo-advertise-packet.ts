/* eslint-disable @typescript-eslint/explicit-function-return-type */
export class XyoAdvertisePacket {
  private data: Buffer

  constructor(data: Buffer) {
    this.data = data
  }

  public getChoice() {
    if (this.data.length === 0) {
      throw new Error('getChoice: Out of index, can`t be 0')
    }

    const sizeOfChoice = this.data.readUInt8(0)

    if (sizeOfChoice + 1 > this.data.length) {
      throw new Error('getChoice: Out of index!')
    }

    return this.data.slice(1, sizeOfChoice + 1)
  }
}
