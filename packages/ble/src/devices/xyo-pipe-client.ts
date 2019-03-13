import { IXyoBluetoothDevice } from '../interfaces/xyo-bluetooth-device'
import { IXyoCharacteristic } from '../interfaces/xyo-characteristic'
import { IXyoNetworkPipe, IXyoNetworkPeer, CatalogueItem } from '@xyo-network/network'
import { XyoLogger } from '@xyo-network/logger'

export class XyoPipeClient implements IXyoNetworkPipe {
  public logger: XyoLogger = new XyoLogger(false, false)

  public peer: IXyoNetworkPeer
  public otherCatalogue: CatalogueItem[] | undefined = undefined
  public initiationData: Buffer | undefined = undefined
  private sessionCharacteristic: IXyoCharacteristic | null = null
  private device: IXyoBluetoothDevice

  constructor(device: IXyoBluetoothDevice) {
    this.device = device

    this.peer = {
      getTemporaryPeerId(): Buffer {
        return new Buffer(device.id)
      }
    }
  }

  public onPeerDisconnect(callback: (hasError: boolean) => void): () => void {
    return () => {
      console.log("disconnect")
    }
  }

  public async tryCreatePipe (): Promise<null | IXyoNetworkPipe> {
    await this.device.connect()
    const services = await this.device.discoverServicesForUuids(["d684352edf36484ebc982d5398c5593e"])

    if (services.length === 1) {
      const characteristics = await services[0].discoverCharacteristics()

      const xyoPipeChar = characteristics.filter((characteristic) => {
        return characteristic.uuid === "727a36390eb44525b1bc7fa456490b2d"
      })

      if (xyoPipeChar.length === 1) {
        this.sessionCharacteristic = characteristics[0]
        await characteristics[0].subscribe()
        return this
      }
    }

    return null
  }

  public async send (data: Buffer, awaitResponse?: boolean): Promise<Buffer | undefined> {
    if (this.sessionCharacteristic != null) {
      await this.chunkSend(data, this.sessionCharacteristic)

      if (awaitResponse !== false) {
        return this.read(this.sessionCharacteristic)
      }

      return undefined
    }

    throw Error("No XYO pipe characteristic")
  }

  public async close(): Promise<void> {
    await this.device.disconnect()
  }

  public read (characteristic: IXyoCharacteristic): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let buffer: Buffer
      let bytesReceived = 0

      characteristic.on("notification", (data, isNotification) => {
        if (bytesReceived === 0) {
          bytesReceived = data.readUInt32BE(0)
          buffer = data.slice(4, data.length)

          if (buffer.length === bytesReceived - 4) {
            resolve(buffer)
          }

          return
        }

        buffer = Buffer.concat([buffer, data])

        if (buffer.length === bytesReceived - 4) {
          resolve(buffer)
        }
      })
    })
  }

  public async chunkSend (data: Buffer, characteristic: IXyoCharacteristic): Promise<void> {
    const chunksToSend = this.chunk(this.addBleSize(data), 20)
    this.logger.info(`Sending entire: ${data.toString('hex')}`)

    for (let i = 0; i < chunksToSend.length; i++) {
      await characteristic.write(chunksToSend[i])
    }
  }

  private chunk (data: Buffer, maxSize: number): Buffer[] {
    const chunks: Buffer[] = []
    let currentIndex = 0

    while (currentIndex !== data.length) {
      const chunkSize = Math.min(maxSize, data.length - currentIndex)
      chunks.push(data.slice(currentIndex, currentIndex + chunkSize))
      currentIndex += chunkSize
    }

    return chunks
  }

  private addBleSize (data: Buffer): Buffer {
    const buffer = Buffer.alloc(4)
    buffer.writeUInt32BE(data.length + 4, 0)
    return Buffer.concat([buffer, data])
  }

}
