
import { PiWifiManager } from '@xyo-network/wifi-manager'
import { startBleServices, NetworkService } from '@xyo-network/bridge-ble'
import { bridgeEntryPoint } from '@xyo-network/bridge'

const piEntryPoint = () => {
  const piWifi = new PiWifiManager()
  const networkService = new NetworkService(piWifi)

  networkService.start()
  startBleServices(process.env.DISPLAY_NAME || 'XYO Bridge', [
    networkService
  ])

  bridgeEntryPoint()
}

piEntryPoint()
