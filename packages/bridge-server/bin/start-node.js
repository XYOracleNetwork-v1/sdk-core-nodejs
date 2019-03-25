#!/usr/bin/env node

// tslint:disable

const { BridgeServer } = require('../dist/index.js');
const { PiWifiManager } = require('@xyo-network/wifi-manager');
const { BridgeConfigurationManager } = require('@xyo-network/bridge-configuration');

function main () {
  const port = Number(process.env.PORT) || 13000
  const configuration = new BridgeConfigurationManager()
  const verifyPin = configuration.verifyPin.bind(configuration)
  const wifi = new PiWifiManager(verifyPin)


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
    console.log('Running', server.context.port)
  })
}

main()
