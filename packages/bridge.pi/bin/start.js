#!/usr/bin/env node

console.log("xyo-pi-bridge start")

const { main } = require('../dist/index.js');

console.log("xyo-pi-bridge imported")
main()