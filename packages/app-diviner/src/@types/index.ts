/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 2nd January 2019 4:41:37 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 28th January 2019 4:12:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IDivinerLauncherConfig {
  port: number,
  data: string
  graphQLPort: number,
  about: {
    version: string,
    url: string,
    address: string,
    ethAddress: string
  },
  ipfs: {
    host: string,
    port: string,
    protocol: 'http' | 'https'
  },
  stakedConsensus: {
    ipfsHash: string
    network: 'kovan' // consider adding main and other networks if appropriate
    platform: 'ethereum' // once other platforms are available this can be extended
  },
  web3: {
    host: string
  },
  ethereumContracts: {
    PayOnDelivery: {
      address: string // must be provided
    }
  },
  discovery: {
    address: string
    seeds: string[]
  }
}
