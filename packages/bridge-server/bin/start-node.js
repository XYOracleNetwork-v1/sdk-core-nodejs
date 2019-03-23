#!/usr/bin/env node

// tslint:disable

const { BridgeServer } = require('../dist/index.js');
const { PiWifiManager } = require('@xyo-network/wifi-manager');
const { startBleServices, NetworkService } = require('@xyo-network/bridge-ble');

const wifi = new PiWifiManager()
const networkService = new NetworkService(wifi)
const server = new BridgeServer({
  port: Number(process.env.PORT) || 13000,
  pin: '0000',
  wifi
});

networkService.start()
.then(() => startBleServices('XYO Bridge', [
  networkService
]))
.then(() => {
  server.start(() => {
    console.log('Running', server.context.port)
  })
})