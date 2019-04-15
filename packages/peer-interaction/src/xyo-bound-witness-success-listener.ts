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

import { IXyoBoundWitnessSuccessListener } from "./@types"
import { IXyoBoundWitness, XyoBoundWitnessValidator } from "@xyo-network/bound-witness"
import { XyoBase } from "@xyo-network/base"
import { IXyoHashProvider, IXyoHash } from "@xyo-network/hashing"
import { IXyoOriginChainRepository } from "@xyo-network/origin-chain"
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"
import { XyoNestedBoundWitnessExtractor } from "./xyo-nested-bound-witness-extractor"
import { CatalogueItem } from "@xyo-network/network"
import { XyoPair } from '@xyo-network/utils'
import { IXyoContentAddressableService } from '@xyo-network/content-addressable-service'

export class XyoBoundWitnessSuccessListener extends XyoBase implements IXyoBoundWitnessSuccessListener {

  // BRIDGE
  constructor (
    private readonly hashingProvider: IXyoHashProvider,
    private readonly boundWitnessValidator: XyoBoundWitnessValidator,
    private readonly originChainRepository: IXyoOriginChainRepository,
    private readonly originBlockRepository: IXyoOriginBlockRepository,
    private readonly contentService: IXyoContentAddressableService
  ) {
    super()
  }

  public async onBoundWitnessSuccess(boundWitness: IXyoBoundWitness, mutex: any, choice: CatalogueItem): Promise<void> {
    const hashValue = await this.hashingProvider.createHash(boundWitness.getSigningData())
    // tslint:disable-next-line:prefer-array-literal
    const content: Array<XyoPair<IXyoHash, Buffer>> = []
    try {
      await this.boundWitnessValidator.validateBoundWitness(hashValue, boundWitness)
    } catch (err) {
      this.logError(`Origin block failed validation. Will not add.`, err)
      throw err
    }

    await this.originBlockRepository.addOriginBlock(hashValue, boundWitness)
    await this.originChainRepository.updateOriginChainState(hashValue, boundWitness, mutex)
    content.push(new XyoPair(hashValue, boundWitness.getSigningData()))

    this.logInfo(`${hashValue.serializeHex()} added to Origin-Chain and Origin-Block-Repository`)
    const nestedBoundWitnesses = new XyoNestedBoundWitnessExtractor().extractNestedBoundWitnesses(boundWitness)

    await nestedBoundWitnesses.reduce(async (promiseChain, nestedBoundWitness) => {
      await promiseChain
      const nestedBw = nestedBoundWitness.getSigningData()
      const nestedHashValue = await this.hashingProvider.createHash(nestedBw)
      const nestedHash = nestedHashValue.serialize() as Buffer
      this.logInfo(`Extracted nested block with hash ${nestedHash.toString('hex')}`)

      const containsBlock = await this.originBlockRepository.containsOriginBlock(nestedHash)
      if (!containsBlock) {
        try {
          await this.boundWitnessValidator.validateBoundWitness(nestedHashValue, nestedBoundWitness)
        } catch (err) {
          this.logError(`Origin block failed validation. Will not add.`, err)
          throw err
        }

        const bwToPersist = nestedBoundWitness.stripMetaData()

        content.push(new XyoPair(nestedHashValue, bwToPersist.serialize()))
        await this.originBlockRepository.addOriginBlock(nestedHashValue, bwToPersist, hashValue)
      }
    }, Promise.resolve() as Promise<void>)

    // Fire and forget
    Promise.all(content.map(async ({ k, v }) => {
      try {
        const b58Key = await this.contentService.add(v)
        this.logInfo(`Successfully upload bound witness with hash ${k.serializeHex()}, address is: ${b58Key}`)
      } catch (err) {
        // log and swallow error
        this.logError(`There was an error uploading bound witness with hash ${k.serializeHex()}`, err)
      }
    }))

    return
  }
}
