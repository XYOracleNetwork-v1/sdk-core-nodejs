/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th December 2018 12:56:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 29th January 2019 5:45:42 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import createDivinerGraphqlServer from '@xyo-network/diviner-graphql-api'
import { XyoGraphQLServer } from '@xyo-network/graphql-server'
import { XyoAboutDiviner } from '@xyo-network/about-diviner'
import { IXyoSCSCDescriptionProvider } from '@xyo-network/scsc'
import { XyoMetaList, XyoMeta } from '@xyo-network/meta-list'
import { XyoQuestionService, IXyoHasIntersectedQuestion, IXyoQuestionService, QuestionsWorker, IBlockPermissionRequestResolver } from '@xyo-network/questions'
import { IXyoDivinerArchivistClient } from '@xyo-network/diviner-archivist-client'
import { XyoDivinerArchivistGraphQLClient } from '@xyo-network/diviner-archivist-client.graphql'
import { XyoIpfsClient, IXyoIpfsClient } from '@xyo-network/ipfs-client'
import { XyoWeb3Service } from '@xyo-network/web3-service'
import { Web3QuestionService } from '@xyo-network/web3-question-service'
import { IDivinerLauncherConfig } from './@types'
import { XyoBaseNode } from '@xyo-network/base-node'
import { XyoLevelDbStorageProvider } from '@xyo-network/storage.leveldb'
import { XyoOriginChainLocalStorageRepository, IXyoOriginChainRepository } from '@xyo-network/origin-chain'
import { promisify } from 'util'
import fs from 'fs'
import { XyoKeyValueDatabase, IXyoStorageProvider } from '@xyo-network/storage'
import { IXyoOriginBlockRepository, XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoHash } from '@xyo-network/hashing'
import { IXyoArchivistNetwork, XyoArchivistNetwork } from '@xyo-network/archivist-network'
import { IXyoComponentFeatureResponse } from '@xyo-network/node-network'
import { IXyoNodeRunnerDelegate } from '@xyo-network/node-runner'

const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

class DivinerLauncher extends XyoBaseNode {

  public server: XyoGraphQLServer | undefined
  private keyValueDb: XyoKeyValueDatabase | undefined
  private originChainMemoryProvider: IXyoStorageProvider | undefined
  private originBlockMemoryProvider: IXyoStorageProvider | undefined

  constructor (private readonly divinerConfig: IDivinerLauncherConfig) {
    super()
  }

  public async start() {
    this.logInfo('Starting Diviner')
    // Origin Chain bootstrap

    await createDirectoryIfNotExists(this.divinerConfig.data)
    const db = XyoLevelDbStorageProvider.createStore(this.divinerConfig.data)
    this.keyValueDb = new XyoKeyValueDatabase(db)
    this.originChainMemoryProvider = await this.keyValueDb!.getOrCreateNamespace('origin-chain')
    this.originBlockMemoryProvider = await this.keyValueDb!.getOrCreateNamespace('origin-block-repository')
    // const questionsService = await this.getQuestionsService()

    // const scscDataProvider = await this.getScscDataProvider()
    // const scsc = await scscDataProvider.resolve()

    // this.server = await createDivinerGraphqlServer(
    //   // The port to run the graphql server on
    //   this.divinerConfig.graphQLPort,

    //   // The `about me` data-provider
    //   async () => {
    //     return new XyoAboutDiviner(
    //       this.divinerConfig.about.version,
    //       this.divinerConfig.about.url,
    //       this.divinerConfig.about.address,
    //       this.divinerConfig.discovery.seeds,
    //       scsc
    //     )
    //   },

    //   // Provides a list archivists this diviner knows about
    //   async () => {
    //     return new XyoMetaList(
    //       new XyoMeta(
    //         this.divinerConfig.discovery.seeds.length,
    //         undefined,
    //         false
    //       ),
    //       this.divinerConfig.discovery.seeds
    //     )
    //   },
    //   {
    //     resolve: (args: IXyoHasIntersectedQuestion) => {
    //       return questionsService.getIntersections(args)
    //     }
    //   }
    // )

    // await this.server.start()
    await super.start()
    const discoveryNetwork = await this.getDiscoveryNetwork()
    const archivistNetwork = await this.getArchivistNetwork()
    discoveryNetwork.onDiscovery(async() => {
      this.logInfo('Starting archivist network')
      archivistNetwork.startFindingPeers()
    })
  }

  public async stop(): Promise<boolean> {
    await super.stop()

    if (this.server) {
      await this.server.stop()
    }

    return true
  }

  public async getQuestionsService(): Promise<IXyoQuestionService> {
    return this.getOrCreate('QuestionsService', async () => {
      const originBlockRepository = await this.getOriginBlockRepository()
      const originChainStateRepository = await this.getOriginStateRepository()
      const blockPermissionRequestResolver = await this.getBlockPermissionRequestResolver()
      const archivistNetwork = await this.getArchivistNetwork()

      return new XyoQuestionService(
        originBlockRepository,
        originChainStateRepository,
        archivistNetwork,
        blockPermissionRequestResolver
      )
    })
  }

  public async getBlockPermissionRequestResolver(): Promise<IBlockPermissionRequestResolver> {
    return this.getOrCreate('BlockPermissionRequestResolver', async () => {
      return {
        requestPermissionForBlock: async (hash: IXyoHash) => {
          return undefined // TODO
        }
      }
    })
  }

  public async getDivinerArchivistClient(): Promise<IXyoDivinerArchivistClient> {
    return this.getOrCreate('IXyoDivinerArchivistClient', async () => {
      if (this.divinerConfig.discovery.seeds.length === 0) {
        throw new Error('At least one archivist seed is required')
      }

      return new XyoDivinerArchivistGraphQLClient(this.divinerConfig.discovery.seeds[0])
    })
  }

  public async getIpfsClient(): Promise<IXyoIpfsClient> {
    return this.getOrCreate('XyoIpfsClient', async () => {
      return new XyoIpfsClient(this.divinerConfig.ipfs)
    })
  }

  public async getScscDataProvider(): Promise<IXyoSCSCDescriptionProvider> {
    return this.getOrCreate('IXyoSCSCDescriptionProvider', async () => {
      return {
        resolve: async () => {
          const ipfsClient = await this.getIpfsClient()
          const files = await ipfsClient.readFiles(this.divinerConfig.stakedConsensus.ipfsHash)

          if (!files || files.length !== 1) {
            this.logError(
              `Undetermined state: Must return one and only one file for ipfs path ${this.divinerConfig.stakedConsensus.ipfsHash}`
            )
            throw new Error('TODO: refactor to proper xyo-error once extracted into correct module')
          }

          const result = JSON.parse(files[0].toString())

          return {
            address: '',
            platform: 'ethereum',
            network: 'kovan',
            abi: JSON.stringify(result.abi),
            bytecode: result.bytecode,
            ipfs: this.divinerConfig.stakedConsensus.ipfsHash
          }
        }
      }
    })
  }

  public async getArchivistNetwork(): Promise<IXyoArchivistNetwork> {
    return this.getOrCreate('IXyoArchivistNetwork', async () => {
      const serializationService = await this.getSerializationService()
      const nodeNetwork = await this.getNodeNetwork()
      return new XyoArchivistNetwork(serializationService, nodeNetwork)
    })
  }

  protected async getP2PAddress(): Promise<string> {
    return this.getOrCreate('P2PAddress', async () => {
      return this.divinerConfig.discovery.address
    })
  }

  protected async getNodeRunnerDelegate(): Promise<IXyoNodeRunnerDelegate> {
    return this.getOrCreate('IXyoNodeRunnerDelegate', async () => {
      const questionsService = await this.getQuestionsService()
      const web3Service = new XyoWeb3Service(
        this.divinerConfig.web3.host,
        this.divinerConfig.about.ethAddress,
        this.divinerConfig.ethereumContracts
      )

      const web3QuestionService = new Web3QuestionService(web3Service)
      const worker = new QuestionsWorker(web3QuestionService, questionsService)
      return worker
    })
  }

  protected getNodePort(): number {
    return this.divinerConfig.port || 11000
  }

  protected async getNodeFeatures(): Promise<IXyoComponentFeatureResponse> {
    return this.getOrCreate('IXyoComponentFeatureResponse', async () => {
      return {
        diviner: {
          featureType: 'diviner',
          supportsFeature: true,
          featureOptions: {}
        }
      }
    })
  }

  protected async getDiscoveryBootstrapNodes(): Promise<string[]> {
    return this.getOrCreate('DiscoveryBootstrapNodes', async () => {
      this.logInfo('Bootstrap nodes', this.divinerConfig.discovery.seeds)
      return this.divinerConfig.discovery.seeds
    })
  }

  protected async getOriginStateRepository(): Promise < IXyoOriginChainRepository > {
    return this.getOrCreate('IXyoOriginChainRepository', async () => {
      const serializationService = await this.getSerializationService()

      if (!this.originChainMemoryProvider) {
        throw new XyoError('OriginChainMemoryProvider must be initialized', XyoErrors.CRITICAL)
      }

      const originBlockRepository = await this.getOriginBlockRepository()
      return new XyoOriginChainLocalStorageRepository(
        this.originChainMemoryProvider,
        originBlockRepository,
        serializationService,
      )
    })
  }

  protected async getOriginBlockRepository(): Promise < IXyoOriginBlockRepository > {
    return this.getOrCreate('IXyoOriginBlockRepository', async () => {
      const serializationService = await this.getSerializationService()

      if (!this.originBlockMemoryProvider) {
        throw new XyoError('OriginBlockMemoryProvider must be initialized', XyoErrors.CRITICAL)
      }

      return new XyoOriginBlockRepository(this.originBlockMemoryProvider, serializationService)
    })
  }
}

export async function main(args: string[]) {
  let config: any | undefined
  try {
    config = await import('./configuration')
  } catch (e) {
    console.error('There was an error during start-up, will exit', e)
    process.exit(-1)
  }

  XyoBase.logger.info(`Launching Diviner with config\n${JSON.stringify(config, null, 2)}`)
  const launcher = new DivinerLauncher(config.default)
  await launcher.start()
}

if (require.main === module) {
  main(process.argv)
}

async function createDirectoryIfNotExists(path: string) {
  try {
    await stat(path)
  } catch (err) {
    if (err.code && err.code === 'ENOENT') {
      await mkdir(path, null)
    }
  }
}
