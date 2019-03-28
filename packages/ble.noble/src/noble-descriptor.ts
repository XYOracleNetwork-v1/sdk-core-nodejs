import { IXyoDescriptor } from '@xyo-network/ble'
import { XyoLogger } from '@xyo-network/logger'
// import noble from '@s524797336/noble-mac'
import noble from 'noble'

export class NobleDescriptor implements IXyoDescriptor {
  public logger: XyoLogger = new XyoLogger(false, false)
  public descriptor: noble.Descriptor

  constructor (descriptor: noble.Descriptor) {
    this.descriptor = descriptor
  }

  get uuid (): string {
    return this.descriptor.uuid
  }

  get name (): string {
    return this.descriptor.name
  }

  get type (): string {
    return this.descriptor.type
  }

  public readValue(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.logger.info(`Trying to read value on descriptor with uuid: ${this.descriptor.uuid}`)

      this.descriptor.readValue((error, data) => {
        if (error == null) {
          this.logger.info(`Successfully read value of descriptor with uuid: ${this.descriptor.uuid}`)
          resolve(data)
        } else {
          this.logger.error(`Error reading value of descriptor with uuid: ${this.descriptor.uuid}`)
          reject(error)
        }
      })
    })
  }

  public writeValue(value: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.info(`Trying to write value to descriptor with uuid: ${this.descriptor.uuid}`)

      this.descriptor.writeValue(value, (error) => {
        if (error == null) {
          this.logger.info(`Successfully wrote value to descriptor with uuid: ${this.descriptor.uuid}`)
          resolve()
        } else {
          this.logger.info(`Error writing value to descriptor with uuid: ${this.descriptor.uuid}`)
          reject(error)
        }
      })
    })
  }
}
