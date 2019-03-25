/*
* @Author: XY | The Findables Company <ryanxyo>
* @Date:   Thursday, 7th February 2019 11:32:52 am
* @Email:  developer@xyfindables.com
* @Filename: xyo-bound-witness-success-listener.ts
* @Last modified by: ryanxyo
* @Last modified time: Thursday, 7th February 2019 11:33:33 am
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/

import { IXyoBoundWitnessSuccessListener, XyoNestedBoundWitnessExtractor } from "@xyo-network/peer-interaction"
import { IXyoBoundWitness, XyoBoundWitnessValidator, XyoBoundWitness, XyoFetter, XyoWitness, XyoKeySet, XyoSignatureSet } from "@xyo-network/bound-witness"
import { XyoBase } from "@xyo-network/base"
import { IXyoHashProvider } from "@xyo-network/hashing"
import { IXyoOriginChainRepository, XyoBridgeBlockSet } from "@xyo-network/origin-chain"
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"
import { CatalogueItem } from "@xyo-network/network"
import { IXyoSerializableObject } from '@xyo-network/serialization'
import { XyoBridgeQueue, XyoBridgeOption } from '@xyo-network/bridge-queue-repository'

export class XyoBridgeBoundWitnessSuccessListener extends XyoBase implements IXyoBoundWitnessSuccessListener {

  constructor (
    private readonly hashingProvider: IXyoHashProvider,
    private readonly boundWitnessValidator: XyoBoundWitnessValidator,
    private readonly originChainRepository: IXyoOriginChainRepository,
    private readonly originBlockRepository: IXyoOriginBlockRepository,
    private readonly bridgeQueue: XyoBridgeQueue,
    private readonly bridgeOption: XyoBridgeOption
  ) {
    super()
  }

  public async onBoundWitnessSuccess(boundWitness: IXyoBoundWitness, mutex: any, choice: CatalogueItem): Promise<void> {
    const hashValue = await this.hashingProvider.createHash(boundWitness.getSigningData())

    try {
      await this.boundWitnessValidator.validateBoundWitness(hashValue, boundWitness)
    } catch (err) {
      this.logError(`Origin block failed validation. Will not add.`, err)
      throw err
    }

    this.bridgeQueue.addQueueItem(hashValue.serialize())

    const removedSubItemsBlock = this.removeSubBoundWitnesses(boundWitness)

    await this.originBlockRepository.addOriginBlock(hashValue, removedSubItemsBlock)

    await this.boundWitnessValidator.validateBoundWitness(hashValue, boundWitness)
    await this.originChainRepository.updateOriginChainState(hashValue, removedSubItemsBlock, mutex)

    this.logInfo(`${hashValue.serializeHex()} added to Origin-Chain and Origin-Block-Repository`)
    const nestedBoundWitnesses = new XyoNestedBoundWitnessExtractor().extractNestedBoundWitnesses(boundWitness)

    await nestedBoundWitnesses.reduce(async (promiseChain, nestedBoundWitness) => {
      await promiseChain
      const nestedHashValue = await this.hashingProvider.createHash(nestedBoundWitness.getSigningData())
      const nestedHash = nestedHashValue.serialize() as Buffer
      this.logInfo(`Extracted nested block with hash ${nestedHash.toString('hex')}`)

      const containsBlock = await this.originBlockRepository.containsOriginBlock(nestedHash)
      if (!containsBlock) {
        try {
          this.bridgeQueue.addQueueItem(nestedHash)
          await this.boundWitnessValidator.validateBoundWitness(nestedHashValue, nestedBoundWitness)
        } catch (err) {
          this.logError(`Origin block failed validation. Will not add.`, err)
          throw err
        }

        await this.originBlockRepository.addOriginBlock(nestedHashValue, nestedBoundWitness, hashValue)
      }
    }, Promise.resolve() as Promise<void>)

    if (choice === CatalogueItem.TAKE_ORIGIN_CHAIN) {
      this.bridgeOption.onCompleted()
    }

    return
  }

  private removeSubBoundWitnesses (boundWitness: IXyoBoundWitness): IXyoBoundWitness {
    // tslint:disable-next-line:prefer-array-literal
    const newBoundWitnessArray: Array<XyoFetter | XyoWitness> = []

    boundWitness.fetterWitnesses.forEach((fOW) => {
      if (fOW instanceof XyoWitness) {
        const newItems: IXyoSerializableObject[] = []
        const array = fOW.getData() as IXyoSerializableObject[]

        array.forEach((item) => {
          if (item.schemaObjectId !== XyoBridgeBlockSet.deserializer.schemaObjectId &&
              item.schemaObjectId !== XyoSignatureSet.deserializer.schemaObjectId) {
            newItems.push(item)
          }
        })

        newBoundWitnessArray.push(new XyoWitness((fOW as XyoWitness).signatureSet, newItems))
      } else if (fOW instanceof XyoFetter) {
        newBoundWitnessArray.push(fOW as XyoFetter)
      }
    })

    return new XyoBoundWitness(newBoundWitnessArray)
  }
}
