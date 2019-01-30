/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 11:39:13 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 29th January 2019 5:43:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseNode } from '@xyo-network/base-node'
import { createArchivistSqlRepository } from '@xyo-network/archivist-repository.sql'
import createGraphqlServer from '@xyo-network/api-archivist-graphql'
import { XyoGraphQLServer } from '@xyo-network/graphql-server'

import { XyoAboutMeService } from '@xyo-network/about-me'
import { XyoIpService } from '@xyo-network/ip-service'
import { IXyoArchivistRepository } from '@xyo-network/archivist-repository'
import { XyoPeerDiscoveryService } from '@xyo-network/peer-discovery'
import { XyoOriginChainLocalStorageRepository, IXyoOriginChainRepository } from '@xyo-network/origin-chain'
import { createDirectoryIfNotExists } from './utils'
import { XyoLevelDbStorageProvider } from '@xyo-network/storage.leveldb'
import configuration from './configuration'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { ProcessManager } from './process-manager'
import { XyoPeerInteractionRouter } from '@xyo-network/peer-interaction-router'
import { CatalogueItem } from '@xyo-network/network'
import { IXyoComponentFeatureResponse } from '@xyo-network/node-network'

export class XyoArchivistNode extends XyoBaseNode {
  private readonly config = configuration
  private server: XyoGraphQLServer | undefined
  private archivistRepository: IXyoArchivistRepository | undefined

  public async start() {
    // Set up
    const serializationService = await this.getSerializationService()
    await this.initializeArchivistRepo()
    await createDirectoryIfNotExists(this.config.data)

    // Call into super implementation
    await super.start()

    // Mount additional archivist functionality
    const aboutMeService = await this.getAboutMeService()
    if (this.config.discovery.enable) {
      aboutMeService.startDiscoveringPeers()
    }

    const originBlockRepository = await this.getOriginBlockRepository()
    const hashingProvider = await this.getHashingProvider()

    this.server = await createGraphqlServer(
      this.config.graphql,
      aboutMeService,
      originBlockRepository,
      hashingProvider,
      serializationService
    )

    this.server.start()
  }

  public async initializeArchivistRepo() {
    if (!this.config.sql) {
      throw new XyoError(`SQL configuration required`, XyoErrors.CRITICAL)
    }

    const serializationService = await this.getSerializationService()

    this.archivistRepository = await createArchivistSqlRepository({
      host: this.config.sql.host,
      database: this.config.sql.database,
      password: this.config.sql.password,
      user: this.config.sql.user,
      port: this.config.sql.port
    }, serializationService)
  }

  public async stop() {
    const success = await super.stop()
    if (this.server) {
      await this.server.stop()
      return success
    }

    return false
  }

  protected getNodePort(): number {
    return this.config.port
  }

  protected async getNodeFeatures(): Promise<IXyoComponentFeatureResponse> {
    return this.getOrCreate('IXyoComponentFeatureResponse', async () => {
      this.logInfo(`Node features support for archivist functionality `)
      return {
        archivist: {
          featureType: 'archivist',
          supportsFeature: true,
          featureOptions: {
            graphqlHost: this.config.publicIpOverride!,
            graphqlPort: this.config.graphql!,
            boundWitnessHost: this.config.publicIpOverride!,
            boundWitnessPort: this.config.port
          }
        }
      }
    })
  }

  protected async getAboutMeService(): Promise<XyoAboutMeService> {
    const originStateRepository = await this.getOriginStateRepository()
    const genesisSigner = await originStateRepository.getGenesisSigner()

    if (!genesisSigner) {
      throw new XyoError(`Could not start about-me service without genesis signer`, XyoErrors.CRITICAL)
    }

    return this.getOrCreate('XyoAboutMeService', () => {
      return new XyoAboutMeService(
        this.getIpService(),
        this.config.nodeVersion || 'unspecified',
        this.config.isPublic,
        genesisSigner.publicKey,
        this.getPeerDiscoveryService(),
        {
          name: this.config.nodeName,
          publicIpOverride: this.config.publicIpOverride
        }
      )
    })
  }

  protected async getPeerInteractionRouter(): Promise<XyoPeerInteractionRouter> {
    return this.getOrCreate('XyoPeerInteractionRouter', async () => {
      const standardBoundWitnessHandlerProvider = await this.getStandardBoundWitnessHandlerProvider()
      const takeOriginChainBoundWitnessHandlerProvider = await this.getTakeOriginChainBoundWitnessHandlerProvider()
      const peerInteractionRouter = new XyoPeerInteractionRouter({
        resolveCategory: (catalogueItems: CatalogueItem[]): CatalogueItem | undefined => {
          if (!catalogueItems || catalogueItems.length < 1) {
            return undefined
          }
          const wantsToGiveOriginChain = Boolean(catalogueItems.find(item => item === CatalogueItem.GIVE_ORIGIN_CHAIN))
          if (wantsToGiveOriginChain) {
            return CatalogueItem.TAKE_ORIGIN_CHAIN
          }

          if (catalogueItems && catalogueItems.length) {
            return catalogueItems[catalogueItems.length - 1]
          }
          return undefined
        }
      })

      // Routes
      peerInteractionRouter.use(
        CatalogueItem.BOUND_WITNESS,
        () => {
          return standardBoundWitnessHandlerProvider
        }
      )

      peerInteractionRouter.use(
        CatalogueItem.TAKE_ORIGIN_CHAIN,
        () => {
          return takeOriginChainBoundWitnessHandlerProvider
        }
      )
      return peerInteractionRouter
    })
  }

  protected getPeerDiscoveryService(): XyoPeerDiscoveryService {
    return this.getOrCreate('XyoPeerDiscoveryService', () => {
      return new XyoPeerDiscoveryService(
        this.config.discovery.bootstrapPeers,
        this.config.discovery.dns,
        this.config.discovery.defaultPort
      )
    })
  }

  protected getIpService(): XyoIpService {
    return this.getOrCreate('XyoIpService', () => {
      return new XyoIpService(this.config.graphql, this.config.port)
    })
  }

  protected async getOriginBlockRepository(): Promise<IXyoArchivistRepository> {
    return this.getOrCreate('IXyoOriginBlockRepository', async () => {
      if (!this.archivistRepository) {
        throw new XyoError(`Archivist repository is not initialized`, XyoErrors.CRITICAL)
      }

      return this.archivistRepository
    })
  }

  protected async getBoundWitnessValidatorSettings() {
    return this.config.validation
  }

  protected async getOriginStateRepository(): Promise<IXyoOriginChainRepository> {
    return this.getOrCreate('IXyoOriginChainRepository', async () => {
      const db = XyoLevelDbStorageProvider.createStore(this.config.data)
      const serializationService = await this.getSerializationService()
      const originBlockRepository = await this.getOriginBlockRepository()
      return new XyoOriginChainLocalStorageRepository(db, originBlockRepository, serializationService)
    })
  }
}

export function main() {
  const archivistNode = new XyoArchivistNode()
  const processManager = new ProcessManager(archivistNode)
  processManager.manage(process)
}

if (require.main === module) {
  main()
}
