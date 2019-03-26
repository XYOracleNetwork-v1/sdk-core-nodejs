#!/usr/bin/env node

// tslint:disable

const { BridgeServer } = require('../dist/index.js');
const { PiWifiManager } = require('@xyo-network/wifi-manager');
const { BridgeConfigurationManager } = require('@xyo-network/bridge-configuration');

function main (ble) {
  const port = Number(process.env.PORT) || 13000
  const configuration = new BridgeConfigurationManager()
  const wifi = new PiWifiManager()

  if (!process.env.SKIP_BLE) {
    const { startBleServices, NetworkService } = require('@xyo-network/bridge-ble');
    const networkService = new NetworkService(wifi)
    networkService.start()
    startBleServices('XYO Bridge', [
      networkService
    ])
  }

  const server = new BridgeServer({
    port,
    wifi,
    configuration
  });
  server.start(() => {
    console.log(`Bridge Server: http://localhost:${server.context.port}`)
  })
}

main()
