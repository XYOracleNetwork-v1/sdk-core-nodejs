#!/usr/bin/env node

// tslint:disable

const { BridgeServer } = require('../dist/index.js');
const { PiWifiManager } = require('@xyo-network/wifi-manager');
const wifi = new PiWifiManager()
const server = new BridgeServer({
  port: 13000,
  pin: '0000',
  wifi
});

server.start(() => {
  console.log('Running', server.context.port)
})