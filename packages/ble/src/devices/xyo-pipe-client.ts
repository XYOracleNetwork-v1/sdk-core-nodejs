import { IXyoBluetoothDevice } from '../interfaces/xyo-bluetooth-device'
import { IXyoCharacteristic } from '../interfaces/xyo-characteristic'
import { IXyoNetworkPipe, IXyoNetworkPeer, CatalogueItem } from '@xyo-network/network'
import { XyoLogger } from '@xyo-network/logger'
import { IXyoSerializableObject } from '@xyo-network/serialization'
import { rssiSerializationProvider } from '@xyo-network/heuristics-common'
import { rejects } from 'assert'
import { XyoBase } from '@xyo-network/base'

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
    const timeout = new Promise<null | IXyoNetworkPipe>((_, reject) => {
      XyoBase.timeout(() => {
        console.log("timeout")
        this.device.disconnect()
        reject("Timeout")
      }, 10000)
    })

    const promise = new Promise<null | IXyoNetworkPipe>(async (resolve, reject) => {

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
          this.sessionCharacteristic = xyoPipeChar[0]
          await xyoPipeChar[0].subscribe()
          this.networkHeuristics = [rssiSerializationProvider.newInstance(this.device.rssi)]
          resolve(this)
        }

        reject("No XYO pipe characteristic 1")
      }

      reject("No XYO service")
    })

    return Promise.race([promise, timeout])
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
    const timeout = new Promise((resolve, reject) => {
      XyoBase.timeout(() => {
        console.log("timeout")
        reject("Timeout")
      }, 12000)
    }) as Promise<Buffer>

    const action = new Promise((resolve, reject) => {
      let buffer: Buffer
      let bytesReceived = 0

      const onData = (data: Buffer, isNotification: boolean) => {
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
      }

      characteristic.on("notification", onData)
    }) as Promise < Buffer >

    return Promise.race([timeout, action])
  }

  public async chunkSend(data: Buffer, characteristic: IXyoCharacteristic): Promise < void > {
    const timeout = new Promise((resolve, reject) => {
      XyoBase.timeout(() => {
        console.log("timeout")
        reject("Timeout")
      }, 10000)
    })

    const action = new Promise(async (resolve, reject) => {

      const chunksToSend = this.chunk(this.addBleSize(data), 20)
      this.logger.info(`Sending entire: ${data.toString('hex')}`)

    // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < chunksToSend.length; i++) {
        await characteristic.write(chunksToSend[i])
      }
      resolve()
    })

    await Promise.race([timeout, action])
  }

  private chunk(data: Buffer, maxSize: number): Buffer[] {
    const chunks: Buffer[] = []
    let currentIndex = 0

    while (currentIndex !== data.length) {
      const chunkSize = Math.min(maxSize, data.length - currentIndex)
      chunks.push(data.slice(currentIndex, currentIndex + chunkSize))
      currentIndex += chunkSize
    }

    return chunks
  }

  private addBleSize(data: Buffer): Buffer {
    const buffer = Buffer.alloc(4)
    buffer.writeUInt32BE(data.length + 4, 0)
    return Buffer.concat([buffer, data])
  }

}
