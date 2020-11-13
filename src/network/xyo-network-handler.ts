import XyoNetworkPipe from './xyo-network-pipe'

export class XyoNetworkHandler {
  private static getSizeEncodedCatalog(catalog: Buffer): Buffer {
    const sizeBuffer = Buffer.alloc(1)
    sizeBuffer.writeUInt8(catalog.length, 0)
    return Buffer.concat([sizeBuffer, catalog])
  }

  public pipe: XyoNetworkPipe

  constructor(pipe: XyoNetworkPipe) {
    this.pipe = pipe
  }

  public sendCatalogPacket(catalog: Buffer): Promise<Buffer | undefined> {
    const buffer = XyoNetworkHandler.getSizeEncodedCatalog(catalog)
    return this.pipe.send(buffer, true)
  }

  public sendChoicePacket(
    choice: Buffer,
    response: Buffer
  ): Promise<Buffer | undefined> {
    const bufferToSend = Buffer.concat([
      XyoNetworkHandler.getSizeEncodedCatalog(choice),
      response,
    ])

    return this.pipe.send(bufferToSend, true)
  }
}
