/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 4:43:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-handler-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 6:17:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe } from '@xyo-network/network'
import { IXyoBoundWitness, XyoBoundWitnessValidator, IXyoBoundWitnessSigningDataProducer } from '@xyo-network/bound-witness'
import { IXyoHashProvider } from '@xyo-network/hashing'
import { IXyoOriginChainStateRepository, IXyoOriginBlockRepository } from '@xyo-network/origin-chain'
import { XyoBase } from '@xyo-network/base'
import { IXyoSerializationService } from '@xyo-network/serialization'
import {
  IXyoBoundWitnessHandlerProvider,
  IXyoBoundWitnessPayloadProvider,
  IXyoBoundWitnessSuccessListener,
  IXyoBoundWitnessInteractionFactory
} from './@types'

import { XyoNestedBoundWitnessExtractor } from './xyo-nested-bound-witness-extractor'

export class XyoBoundWitnessHandlerProvider extends XyoBase implements IXyoBoundWitnessHandlerProvider {

  constructor (
    private readonly hashingProvider: IXyoHashProvider,
    private readonly originState: IXyoOriginChainStateRepository,
    private readonly originChainNavigator: IXyoOriginBlockRepository,
    private readonly boundWitnessPayloadProvider: IXyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener,
    private readonly boundWitnessInteractionFactory: IXyoBoundWitnessInteractionFactory,
    private readonly originBlockValidator: XyoBoundWitnessValidator,
    private readonly boundWitnessSigningDataProducer: IXyoBoundWitnessSigningDataProducer,
    private readonly nestedBoundWitnessExtractor: XyoNestedBoundWitnessExtractor,
    private readonly serializationService: IXyoSerializationService
  ) {
    super()
  }

  public async handle(networkPipe: IXyoNetworkPipe): Promise<IXyoBoundWitness> {
    const [payload, signers] = await Promise.all([
      this.boundWitnessPayloadProvider.getPayload(this.originState),
      this.originState.getSigners()
    ])

    const interaction = this.boundWitnessInteractionFactory.newInstance(signers, payload)

    const boundWitness = await interaction.run(networkPipe)
    await this.handleBoundWitnessSuccess(boundWitness)
    return boundWitness
  }

  /**
   * A helper function for processing successful bound witnesses
   */

  private async handleBoundWitnessSuccess(boundWitness: IXyoBoundWitness): Promise<void> {
    const hashValue = await this.hashingProvider.createHash(
      this.boundWitnessSigningDataProducer.getSigningData(boundWitness)
    )

    try {
      await this.originBlockValidator.validateBoundWitness(hashValue, boundWitness)
    } catch (err) {
      this.logError(`Origin block failed validation. Will not add.`, err)
      throw err
    }

    await this.originState.updateOriginChainState(hashValue)
    await this.originChainNavigator.addOriginBlock(hashValue, boundWitness)
    const nestedBoundWitnesses = this.nestedBoundWitnessExtractor.extractNestedBoundWitnesses(boundWitness)

    await nestedBoundWitnesses.reduce(async (promiseChain, nestedBoundWitness) => {
      await promiseChain
      const nestedHashValue = await this.hashingProvider.createHash(
        this.boundWitnessSigningDataProducer.getSigningData(nestedBoundWitness)
      )
      const nestedHash = this.serializationService.serialize(nestedHashValue, 'buffer') as Buffer
      this.logInfo(`Extracted nested block with hash ${nestedHash.toString('hex')}`)
      const containsBlock = await this.originChainNavigator.containsOriginBlock(nestedHash)
      if (!containsBlock) {
        try {
          await this.originBlockValidator.validateBoundWitness(nestedHashValue, nestedBoundWitness)
        } catch (err) {
          this.logError(`Origin block failed validation. Will not add.`, err)
          throw err
        }

        await this.originChainNavigator.addOriginBlock(nestedHashValue, nestedBoundWitness, hashValue)
      }
    }, Promise.resolve() as Promise<void>)

    if (this.boundWitnessSuccessListener) {
      await this.boundWitnessSuccessListener.onBoundWitnessSuccess(boundWitness)
    }

    return
  }
}
