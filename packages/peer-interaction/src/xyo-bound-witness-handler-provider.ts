/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 4:43:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-handler-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe, CatalogueItem } from '@xyo-network/network'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoOriginChainRepository, IXyoOriginChainMutex } from '@xyo-network/origin-chain'
import { XyoBase } from '@xyo-network/base'
import {
  IXyoBoundWitnessHandlerProvider,
  IXyoBoundWitnessPayloadProvider,
  IXyoBoundWitnessSuccessListener,
  IXyoBoundWitnessInteractionFactory
} from './@types'
import { XyoError, XyoErrors } from '@xyo-network/errors'

export class XyoBoundWitnessHandlerProvider extends XyoBase implements IXyoBoundWitnessHandlerProvider {

  constructor (
    private readonly originStateRepository: IXyoOriginChainRepository,
    private readonly boundWitnessPayloadProvider: IXyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener,
    private readonly boundWitnessInteractionFactory: IXyoBoundWitnessInteractionFactory,
  ) {
    super()
  }

  public async handle(
      networkPipe: IXyoNetworkPipe,
      didInit: boolean,
      choice: CatalogueItem): Promise<IXyoBoundWitness | undefined> {

    const mutex = await this.tryGetMutex(0)
    try {
      const [payload, signers] = await Promise.all([
        this.boundWitnessPayloadProvider.getPayload(this.originStateRepository, choice),
        this.originStateRepository.getSigners()
      ])

      const interaction = this.boundWitnessInteractionFactory.newInstance(signers, payload)

      const boundWitness = await interaction.run(networkPipe, didInit)
      await this.boundWitnessSuccessListener.onBoundWitnessSuccess(boundWitness, mutex, choice)
      return boundWitness
    } catch (e) {
      this.logError("Bound witness handle error", e)
      return
    } finally {
      await this.originStateRepository.releaseMutex(mutex)
    }
  }

  private async tryGetMutex(currentTry: number): Promise<IXyoOriginChainMutex> {
    const mutex = await this.originStateRepository.acquireMutex()
    if (mutex) return mutex
    if (currentTry === 3) throw new XyoError(`Could not acquire mutex for origin chain`)
    return new Promise((resolve, reject) => {
      XyoBase.timeout(() => {
        this.tryGetMutex(currentTry + 1).then(resolve).catch(reject)
      }, 100 * (currentTry + 1)) // linear back-off
    })
  }
}
