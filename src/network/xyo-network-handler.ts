import { IXyoNetworkPipe } from './xyo-network-pipe'

export class XyoNetworkHandler {

  private static getSizeEncodedCatalogue(catalogue: Buffer): Buffer {
    const sizeBuffer = Buffer.alloc(1)
    sizeBuffer.writeUInt8(catalogue.length, 0)
    return Buffer.concat([sizeBuffer, sizeBuffer])
  }

  public pipe: IXyoNetworkPipe

  constructor(pipe: IXyoNetworkPipe) {
    this.pipe = pipe
  }

  public sendCataloguePacket(catalogue: Buffer): Promise<Buffer | undefined> {
    const buffer = XyoNetworkHandler.getSizeEncodedCatalogue(catalogue)
    return this.pipe.send(buffer, true)
  }

  public sendChoicePacket(choice: Buffer, response: Buffer): Promise<Buffer | undefined> {
    const bufferToSend = Buffer.concat([
      XyoNetworkHandler.getSizeEncodedCatalogue(choice),
      response
    ])

    return this.pipe.send(bufferToSend, true)
  }
}
