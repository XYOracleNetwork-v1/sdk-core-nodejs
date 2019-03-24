#!/usr/bin/env node

// tslint:disable

const { BridgeServer } = require('../dist/index.js');
const { PiWifiManager } = require('@xyo-network/wifi-manager');
const { BridgeConfigurationManager } = require('@xyo-network/bridge-configuration');
const { startBleServices, NetworkService } = require('@xyo-network/bridge-ble');

const pin = (process.env.PIN || '0000').slice(0, 4)
const port = Number(process.env.PORT) || 13000
const configuration = new BridgeConfigurationManager()
const verifyPin = configuration.verifyPin.bind(configuration)
const wifi = new PiWifiManager(verifyPin)
const networkService = new NetworkService(wifi)
const server = new BridgeServer({
  port,
  pin,
  wifi,
  configuration
});

networkService.start()
startBleServices('XYO Bridge', [
  networkService
])
server.start(() => {
  console.log('Running', server.context.port)
})