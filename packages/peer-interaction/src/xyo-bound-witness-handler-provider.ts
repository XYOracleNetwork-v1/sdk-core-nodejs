/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 4:43:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-handler-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 12:25:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe } from '@xyo-network/network'
import { IXyoBoundWitness, XyoBoundWitnessValidator, IXyoBoundWitnessSigningDataProducer } from '@xyo-network/bound-witness'
import { IXyoHashProvider, IXyoHash } from '@xyo-network/hashing'
import { IXyoOriginChainRepository } from '@xyo-network/origin-chain'
import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { XyoBase } from '@xyo-network/base'
import { IXyoTypeSerializer } from '@xyo-network/serialization'
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
    private readonly originStateRepository: IXyoOriginChainRepository,
    private readonly originBlockRepository: IXyoOriginBlockRepository,
    private readonly boundWitnessPayloadProvider: IXyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener,
    private readonly boundWitnessInteractionFactory: IXyoBoundWitnessInteractionFactory,
    private readonly boundWitnessValidator: XyoBoundWitnessValidator,
    private readonly boundWitnessSigningDataProducer: IXyoBoundWitnessSigningDataProducer,
    private readonly nestedBoundWitnessExtractor: XyoNestedBoundWitnessExtractor,
    private readonly hashSerializer: IXyoTypeSerializer<IXyoHash>
  ) {
    super()
  }

  public async handle(networkPipe: IXyoNetworkPipe): Promise<IXyoBoundWitness> {
    const [payload, signers] = await Promise.all([
      this.boundWitnessPayloadProvider.getPayload(this.originStateRepository),
      this.originStateRepository.getSigners()
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
      await this.boundWitnessValidator.validateBoundWitness(hashValue, boundWitness)
      this.logInfo(`Bound Witness Validated`)
    } catch (err) {
      this.logError(`Origin block failed validation. Will not add.`, err)
      throw err
    }

    await this.originStateRepository.updateOriginChainState(hashValue)
    await this.originBlockRepository.addOriginBlock(hashValue, boundWitness)
    const nestedBoundWitnesses = this.nestedBoundWitnessExtractor.extractNestedBoundWitnesses(boundWitness)

    await nestedBoundWitnesses.reduce(async (promiseChain, nestedBoundWitness) => {
      await promiseChain
      const nestedHashValue = await this.hashingProvider.createHash(
        this.boundWitnessSigningDataProducer.getSigningData(nestedBoundWitness)
      )
      const nestedHash = this.hashSerializer.serialize(nestedHashValue, 'buffer') as Buffer
      this.logInfo(`Extracted nested block with hash ${nestedHash.toString('hex')}`)
      const containsBlock = await this.originBlockRepository.containsOriginBlock(nestedHash)
      if (!containsBlock) {
        try {
          await this.boundWitnessValidator.validateBoundWitness(nestedHashValue, nestedBoundWitness)
        } catch (err) {
          this.logError(`Origin block failed validation. Will not add.`, err)
          throw err
        }

        await this.originBlockRepository.addOriginBlock(nestedHashValue, nestedBoundWitness, hashValue)
      }
    }, Promise.resolve() as Promise<void>)

    if (this.boundWitnessSuccessListener) {
      await this.boundWitnessSuccessListener.onBoundWitnessSuccess(boundWitness)
    }

    return
  }
}
