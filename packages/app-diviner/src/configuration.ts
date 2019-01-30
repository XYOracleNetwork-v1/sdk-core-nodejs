/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 2nd January 2019 4:31:28 pm
 * @Email:  developer@xyfindables.com
 * @Filename: configuration.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 29th January 2019 2:44:25 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import path from 'path'
import { IDivinerLauncherConfig } from './@types'

/** if its not set, set it to the default */
process.env.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR || path.join(__dirname, '..', 'config')

// tslint:disable-next-line:no-console
console.log(`Loading Configuration from ${process.env.NODE_CONFIG_DIR}`)

import config from 'config'

class XyoDivinerConfig implements IDivinerLauncherConfig {
  public port = (() => {
    return parseInt(config.get<string>('port'), 10)
  })()

  public graphQLPort = (() => {
    return parseInt(config.get<string>('graphQLPort'), 10)
  })()

  public data = (() => {
    return config.get('data') as string
  })()

  public about = {
    version: config.get<string>('about.version'),

    url: config.get<string>('about.url'),

    address: config.get<string>('about.address'),

    ethAddress: config.get<string>('about.ethAddress')
  }

  public ipfs = {
    host: config.get<string>('ipfs.host'),
    port: config.get<string>('ipfs.port'),
    protocol: config.get<string>('ipfs.protocol') as 'http' | 'https'
  }

  public stakedConsensus = {
    ipfsHash: config.get<string>('stakedConsensus.ipfsHash'),
    network: config.get<string>('stakedConsensus.network') as 'kovan',
    platform: config.get<string>('stakedConsensus.platform') as 'ethereum'
  }

  public web3 = {
    host: config.get<string>('web3.host'),
  }

  public ethereumContracts = {
    PayOnDelivery: {
      address: config.get<string>('ethereumContracts.PayOnDelivery.address'),
    }
  }

  public discovery = {
    address: (() => {
      return `/ip4/${config.get<string>('discovery.ip')}/tcp/${config.get<number>('discovery.port')}`
    })(),
    seeds: (() => {
      const val = config.get('discovery.seeds')
      if (Array.isArray(val)) {
        return val.map(seed => `/ip4/${seed.ip}/tcp/${seed.port}`)
      }

      if (!val || typeof val !== 'string' || val.length < 1) {
        return []
      }

      return val
        .split(',')
        .map(s => s.trim())
        .map(s => s.split(':').reduce((m, p, currentIndex) => {
          if (currentIndex === 0) {
            return `${m}/ip4/${p}`
          }

          return `${m}/tcp/${p}`
        }, ''))
    })()
  }
}

export default new XyoDivinerConfig()
