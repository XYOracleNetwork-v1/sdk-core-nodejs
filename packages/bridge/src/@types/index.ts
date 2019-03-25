import { resolvers, IResolvers } from '@xyo-network/base-node'
import { IXyoHashProvider } from '@xyo-network/hashing'
import { IXyoStorageProvider } from '@xyo-network/storage'
import { IXyoBridgeQueueRepository } from '@xyo-network/bridge-queue-repository'
import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoOriginChainRepository, XyoOriginChainLocalStorageRepository } from '../../../origin-chain/dist'
import { XyoLogger } from '@xyo-network/logger'

export interface IXyoBridgeConfig {
  hasher: IXyoHashProvider
  storageProvider: IXyoStorageProvider
  bridgeQueueRepo: IXyoBridgeQueueRepository
  blockRepo: IXyoOriginBlockRepository
  chainRepo: XyoOriginChainLocalStorageRepository
  logger: XyoLogger
}
