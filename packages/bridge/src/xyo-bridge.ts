import { XyoLogger } from '@xyo-network/logger'
import { resolvers, IResolvers, XyoNode, IXyoNodeOptions, IXyoNetworkConfig, IXyoNodeConfig } from '@xyo-network/base-node'
import { IXyoOriginBlockRepository, XyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { XyoOriginChainStateInMemoryRepository, XyoOriginChainLocalStorageRepository } from '@xyo-network/origin-chain'
import { NobleScan } from '@xyo-network/ble.noble'
import { serializer } from '@xyo-network/serializer'
import { XyoBluetoothNetwork } from '@xyo-network/network.ble'
import { getSignerProvider } from '@xyo-network/signing.ecdsa'
import { IXyoPayload, XyoBoundWitness, XyoBoundWitnessValidator } from '@xyo-network/bound-witness'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoProvider } from '@xyo-network/utils'
import { XyoBoundWitnessInteraction } from '@xyo-network/peer-interaction-handlers'
import { IXyoNetworkProcedureCatalogue, CatalogueItem, IXyoNetworkProvider } from '@xyo-network/network'
import { XyoStorageBridgeQueueRepository } from '@xyo-network/bridge-queue-repository.keyvalue'
import { XyoLevelDbStorageProvider } from '@xyo-network/storage.leveldb'
import { IXyoHashProvider, getHashingProvider, IXyoHash } from '@xyo-network/hashing'
import { XyoBridgeQueue, XyoBridgeOption } from '@xyo-network/bridge-queue-repository'
import { IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessSuccessListener, IXyoBoundWitnessInteractionFactory, XyoBoundWitnessPayloadProvider, XyoBoundWitnessSuccessListener, XyoBoundWitnessHandlerProvider } from '@xyo-network/peer-interaction'
import { XyoBridgeBoundWitnessSuccessListener } from './xyo-bridge-bound-witness-success-listener'
import { XyoNodeRunner, IXyoNodeRunnerDelegate } from '@xyo-network/node-runner'
import { XyoPeerInteractionRouter } from '@xyo-network/peer-interaction-router'
import { XyoBrideProcedureCatalogue } from './xyo-bridge-procedure-catalogue'
import { XyoClientTcpNetwork, IXyoNetworkAddressProvider, IXyoTCPNetworkAddress } from '@xyo-network/network.tcp'
import { IXyoPeerConnectionDelegate, XyoSimplePeerConnectionDelegate, XyoPeerConnectionHandler, IXyoCatalogueResolver } from '@xyo-network/peer-connections'
import { IXyoBridgeConfig } from './@types'

export class XyoBridge {
  public networkDelegate: XyoSimplePeerConnectionDelegate
  public toNetworkDelegate: XyoSimplePeerConnectionDelegate
  public bridgeQueue = new XyoBridgeQueue(this.bridgeConfig.bridgeQueueRepo)

  public bridgeOption = new XyoBridgeOption(this.bridgeConfig.blockRepo, this.bridgeQueue, this.bridgeConfig.hasher)
  public payloadProvider = new XyoBoundWitnessPayloadProvider()
  private running = false

  private networkCatResolver: IXyoCatalogueResolver = {
    resolveCategory: (catalogueItems: CatalogueItem[]): CatalogueItem | undefined => {

      for (const item of catalogueItems) {
        if (item === CatalogueItem.GIVE_ORIGIN_CHAIN) {
          return CatalogueItem.TAKE_ORIGIN_CHAIN
        }
      }

      for (const item of catalogueItems) {
        if (item === CatalogueItem.TAKE_ORIGIN_CHAIN) {
          return CatalogueItem.GIVE_ORIGIN_CHAIN
        }
      }

      return CatalogueItem.BOUND_WITNESS
    }
  }

  private networkRouter = new XyoPeerInteractionRouter()

  private boundWitnessValidator = new XyoBoundWitnessValidator()

  private networkHandler = new XyoPeerConnectionHandler(this.networkRouter, this.networkCatResolver)

  private success = new XyoBridgeBoundWitnessSuccessListener(
    this.bridgeConfig.hasher,
    this.boundWitnessValidator,
    this.bridgeConfig.chainRepo,
    this.bridgeConfig.blockRepo,
    this.bridgeQueue,
    this.bridgeOption
  )

  private interactionFactory: IXyoBoundWitnessInteractionFactory = {
    newInstance: (signersForBoundWitness, payload) =>  {
      return new XyoBoundWitnessInteraction(
        signersForBoundWitness,
        payload,
        serializer,
        CatalogueItem.BOUND_WITNESS
      )
    }
  }

  private standardBoundWitnessHandlerProvider = new XyoBoundWitnessHandlerProvider(
    this.bridgeConfig.chainRepo,
    this.payloadProvider,
    this.success,
    this.interactionFactory
  )

  constructor(private bridgeFromNetwork: IXyoNetworkProvider,
              private bridgeToNetwork: IXyoNetworkProvider,
              private bridgeConfig: IXyoBridgeConfig) {

    const bridgeProcedureCatalogueCollect = new XyoBrideProcedureCatalogue(
      [
        CatalogueItem.GIVE_ORIGIN_CHAIN,
        CatalogueItem.TAKE_ORIGIN_CHAIN,
        CatalogueItem.BOUND_WITNESS
      ]
    )

    const bridgeProcedureCatalogueSend = new XyoBrideProcedureCatalogue(
      [
        CatalogueItem.GIVE_ORIGIN_CHAIN,
        CatalogueItem.TAKE_ORIGIN_CHAIN,
      ]
     )

    this.networkDelegate = new XyoSimplePeerConnectionDelegate(
      bridgeFromNetwork,
      bridgeProcedureCatalogueCollect,
      this.networkHandler
    )

    this.toNetworkDelegate = new XyoSimplePeerConnectionDelegate(
      bridgeToNetwork,
      bridgeProcedureCatalogueSend,
      this.networkHandler
    )
  }

  public mainBridgeLoop = async () => {
    this.bridgeConfig.logger.info(`Bridge on new cycle`)

    try {
      const blePipe = await this.networkDelegate.provideConnection()
      await this.networkDelegate.handlePeerConnection(blePipe)

      const tcpPipe = await this.toNetworkDelegate.provideConnection()
      await this.toNetworkDelegate.handlePeerConnection(tcpPipe)
      await tcpPipe.close()

      const blocksToRemove = this.bridgeQueue.getBlocksToRemove()

      for (const block of blocksToRemove) {
        await this.bridgeConfig.blockRepo.removeOriginBlock(block)
      }

      await this.bridgeConfig.bridgeQueueRepo.commit()

    } catch (error) {
      this.bridgeConfig.logger.error(`Uncaught error: ${error}`)
    }

    this.bridgeConfig.logger.info(`Bridge has block height: ${await this.bridgeConfig.chainRepo.getIndex()}`)

  }

  public async init() {
    this.payloadProvider.addBoundWitnessOption(CatalogueItem.TAKE_ORIGIN_CHAIN, this.bridgeOption)

    this.networkRouter.use(CatalogueItem.BOUND_WITNESS, () => {
      return this.standardBoundWitnessHandlerProvider
    })

    this.networkRouter.use(CatalogueItem.TAKE_ORIGIN_CHAIN, () => {
      return this.standardBoundWitnessHandlerProvider
    })

    this.networkRouter.use(CatalogueItem.GIVE_ORIGIN_CHAIN, () => {
      return this.standardBoundWitnessHandlerProvider
    })

    await this.bridgeConfig.bridgeQueueRepo.restore()

    if (await this.bridgeConfig.chainRepo.getIndex() === 0) {
      const newSigner = getSignerProvider("secp256k1-sha256").newInstance()

      this.bridgeConfig.logger
        .info(`Creating first signer, has public key: ${newSigner.publicKey.getData().toString('hex')}`)

      await this.bridgeConfig.chainRepo.setCurrentSigners([newSigner])
      const boundWitness = await this.bridgeConfig.chainRepo.createGenesisBlock()

      this.success.onBoundWitnessSuccess(boundWitness, undefined, CatalogueItem.BOUND_WITNESS)
    }
  }

  public start () {
    this.running = true
    this.asyncLoop()
  }

  public stop () {
    this.running = false
  }

  private async asyncLoop () {
    while (this.running) {
      await this.mainBridgeLoop()
    }
  }
}
