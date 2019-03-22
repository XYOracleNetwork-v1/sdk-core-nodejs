
import { PiWifiManager } from '@xyo-network/wifi-manager'
import { startBleServices, NetworkService } from '@xyo-network/bridge-ble'
import { bridgeEntryPoint } from '@xyo-network/bridge'
import { BridgeServer } from '@xyo-network/bridge-server'

const piEntryPoint = async () => {
  const port = 13000
  const piWifi = new PiWifiManager()
  const server = new BridgeServer({ port, wifi: piWifi })
  const networkService = new NetworkService(piWifi)
  await networkService.start()
  await startBleServices(process.env.DISPLAY_NAME || 'XYO Bridge', [
    networkService
  ])

  server.start(() => {
    console.log('Server ready at', `http://localhost:${port}`)
  })

  bridgeEntryPoint()
}

piEntryPoint()
