/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 4:43:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-handler-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 7th February 2019 11:39:11 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe } from '@xyo-network/network'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoOriginChainRepository } from '@xyo-network/origin-chain'
import { XyoBase } from '@xyo-network/base'
import {
  IXyoBoundWitnessHandlerProvider,
  IXyoBoundWitnessPayloadProvider,
  IXyoBoundWitnessSuccessListener,
  IXyoBoundWitnessInteractionFactory
} from './@types'

export class XyoBoundWitnessHandlerProvider extends XyoBase implements IXyoBoundWitnessHandlerProvider {

  constructor (
    private readonly originStateRepository: IXyoOriginChainRepository,
    private readonly boundWitnessPayloadProvider: IXyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener,
    private readonly boundWitnessInteractionFactory: IXyoBoundWitnessInteractionFactory,
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
    await this.boundWitnessSuccessListener.onBoundWitnessSuccess(boundWitness)
    return boundWitness
  }
}
