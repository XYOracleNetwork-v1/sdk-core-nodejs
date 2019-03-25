#!/usr/bin/env node

console.log("xyo-pi-bridge start")

const { startPi } = require('../dist/index.js');

console.log("xyo-pi-bridge imported")
startPi()