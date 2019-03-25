import { IXyoBluetoothDevice } from '../interfaces/xyo-bluetooth-device'
import { IXyoCharacteristic } from '../interfaces/xyo-characteristic'
import { IXyoNetworkPipe, IXyoNetworkPeer, CatalogueItem } from '@xyo-network/network'
import { XyoLogger } from '@xyo-network/logger'
import { IXyoSerializableObject } from '@xyo-network/serialization'
import { rssiSerializationProvider } from '@xyo-network/heuristics-common'

export class XyoPipeClient implements IXyoNetworkPipe {
  public networkHeuristics: IXyoSerializableObject[] = []
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
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject("Timeout")
      }, 10000)

      if (this.device.state !== 'connected') {
        await this.device.connect()
      }

      const services = await this.device.discoverServicesForUuids(["d684352edf36484ebc982d5398c5593e"])

      if (services.length === 1) {
        const characteristics = await services[0].discoverCharacteristics()

        const xyoPipeChar = characteristics.filter((characteristic) => {
          return characteristic.uuid === "727a36390eb44525b1bc7fa456490b2d"
        })

        if (xyoPipeChar.length === 1) {
          this.sessionCharacteristic = characteristics[0]
          await characteristics[0].subscribe()
          this.networkHeuristics = [rssiSerializationProvider.newInstance(this.device.rssi)]
          clearTimeout(timeout)
          resolve(this)
        }

        clearTimeout(timeout)
        reject("No XYO pipe characteristic 1")
      }

      clearTimeout(timeout)
      resolve(null)
    })
  }

  public async send (data: Buffer, awaitResponse?: boolean): Promise<Buffer | undefined> {
    if (this.sessionCharacteristic != null) {
      await this.chunkSend(data, this.sessionCharacteristic)

      if (awaitResponse !== false) {
        return this.read(this.sessionCharacteristic)
      }

      return undefined
    }

    throw Error("No XYO pipe characteristic 2")
  }

  public async close(): Promise<void> {
    await this.device.disconnect()
  }

  public read (characteristic: IXyoCharacteristic): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let buffer: Buffer
      let bytesReceived = 0

      const timeout = setTimeout(() => {
        reject("Timeout")
      }, 20000)

      characteristic.on("notification", (data, isNotification) => {
        if (bytesReceived === 0) {
          bytesReceived = data.readUInt32BE(0)
          buffer = data.slice(4, data.length)

          if (buffer.length === bytesReceived - 4) {
            clearTimeout(timeout)
            resolve(buffer)
          }

          return
        }

        buffer = Buffer.concat([buffer, data])

        if (buffer.length === bytesReceived - 4) {
          clearTimeout(timeout)
          resolve(buffer)
        }
      })
    })
  }

  public async chunkSend (data: Buffer, characteristic: IXyoCharacteristic): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject("Timeout")
      }, 10000)

      const chunksToSend = this.chunk(this.addBleSize(data), 20)
      this.logger.info(`Sending entire: ${data.toString('hex')}`)

    // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < chunksToSend.length; i++) {
        await characteristic.write(chunksToSend[i])
      }

      clearTimeout(timeout)
      resolve()
    })
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
