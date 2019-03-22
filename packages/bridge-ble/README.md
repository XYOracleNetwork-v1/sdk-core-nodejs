
[logo]: https://www.xy.company/img/home/logo_xy.png

![logo]

# Bridge-ble

Bluetooth gatt implementation for remote bridge discovery and control

## Install

Using yarn

```sh
  yarn add @xyo-network/bridge-ble
```

Using npm

```sh
  npm install @xyo-network/bridge-ble --save
```

## Usage

```js
import { startBleServices, NetworkService } from '@xyo-network/bridge-ble'
import { PiWifiManager } from '@xyo-network/wifi-manager'

((async function (name) {
  const wifiManager = new PiWifiManager()
  const networkService = new NetworkService(wifiManager)
  const services = [
    networkService
  ]

  await networkService.start()
  startBleServices(name, services)
}))(process.env.DISPLAY_NAME)
```
