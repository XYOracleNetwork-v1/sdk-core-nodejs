[logo]: https://www.xy.company/img/home/logo_xy.png

![logo]

# About me

The about me module provides peer descriptions for a node in the xyo network. It also plays a role in socializing nodes such that a peer to peer network can be formed.

## Install

Using yarn

```sh
  yarn add @xyo-network/about-me
```

Using npm

```sh
  npm install @xyo-network/about-me --save
```

## Usage

```javascript
  import { XyoAboutMeService } from '@xyo-network/about-me'

  const aboutMeService = new XyoAboutMeService(
    getIpService()
    getVersion()
    getIsPubliclyAddressable()
    getGenesisPublicKey()
    getPeerDiscoverService()
  )

  // Gets the about me response that your node can share
  await aboutMeService.getAboutMe()

  // If passed with an `aboutMe` from some other node it will add
  // the description to a queue of nodes to interrogate as a potential
  // peer
  await aboutMeService.getAboutMe(otherNodesAboutMe)

  // Start discovering nodes in the xyo network
  const stopDiscoveringFn = aboutMeService.startDiscoveringPeers()

  // DO STUFF

  // Calling this will stop the node-discovery process
  stopDiscoveringFn()
```