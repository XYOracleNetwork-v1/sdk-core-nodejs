import { IXyoNetworkProvider, IXyoNetworkProcedureCatalogue, IXyoNetworkPipe } from '@xyo-network/network'
import { XyoNearbyDevices, IXyoScann, IXyoBluetoothDevice, XyoPipeClient } from '@xyo-network/ble'

export class XyoBluetoothNetwork implements IXyoNetworkProvider {
  private scanner: IXyoScann
  private nearbyDevices: XyoPipeClient[] = []
  private nearby = new XyoNearbyDevices()

  constructor(scanner: IXyoScann) {
    this.scanner = scanner
  }

  public find(catalogue: IXyoNetworkProcedureCatalogue): Promise <IXyoNetworkPipe> {
    return new Promise(async (resolve, reject) => {
      let tryingDevice = false
      let timeout: NodeJS.Timeout | null = null

      await this.scanner.startScan()

      const scanLambda = () => {
        const nearbyNow = this.scanner.getDevices()
        this.nearbyDevices = this.nearby.nearby(nearbyNow)

        if (!tryingDevice && this.nearbyDevices.length > 0) {
          const randomDevice = this.nearbyDevices[Math.floor(Math.random() * this.nearbyDevices.length)]
          tryingDevice = true

          randomDevice.tryCreatePipe().then((createdPipe) => {
            if (timeout) {
              clearInterval(timeout)
            }

            if (createdPipe) {
              this.scanner.stopScan()
              resolve(createdPipe)
            } else {
              tryingDevice = false
            }
          }).catch((e) => {
            console.log(`Failed ${e}`)
            this.scanner.startScan()
            tryingDevice = false
          })
        }
      }

      timeout = setInterval(scanLambda, 1000)
    })
  }

  public stopServer(): Promise <void> {
    return this.scanner.stopScan()
  }

}
