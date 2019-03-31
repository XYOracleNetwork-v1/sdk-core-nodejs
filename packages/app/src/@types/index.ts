/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 15th February 2019 4:57:38 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:04:48 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IArchivistRepositoryConfig } from '@xyo-network/archivist-repository'

export interface IEthCryptoKeys {
  address: string
  privateKey?: string
  encryptedKey?: string
  salt?: string
}
export interface ICreateConfigResult {
  startNode: boolean
  config: IAppConfig
}

export interface IAppConfig {
  ip: string
  p2pPort: number
  serverPort: number | null
  data: string
  name: string
  graphqlPort: number | null
  apis: string[]
  bootstrapNodes: string[]
  archivist: {
    repository: IArchivistRepositoryConfig
  } | null
  diviner: {
    ethereum: {
      host: string
      account: IEthCryptoKeys
      contracts: {
        [s: string]: {
          ipfsHash: string
          address: string
        }
      }
    }
  } | null
  ipfs: {
    host: string
    port: string
    protocol: string
  }
}
export interface IEthContractAddressIPFS {
  ipfsHash: string
  address: string
}
