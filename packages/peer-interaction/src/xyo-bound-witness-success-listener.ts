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
import { IXyoHashProvider } from "@xyo-network/hashing"
import { IXyoOriginChainRepository } from "@xyo-network/origin-chain"
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"
import { XyoNestedBoundWitnessExtractor } from "./xyo-nested-bound-witness-extractor"

export class XyoBoundWitnessSuccessListener extends XyoBase implements IXyoBoundWitnessSuccessListener {

  constructor (
    private readonly hashingProvider: IXyoHashProvider,
    private readonly boundWitnessValidator: XyoBoundWitnessValidator,
    private readonly originChainRepository: IXyoOriginChainRepository,
    private readonly originBlockRepository: IXyoOriginBlockRepository
  ) {
    super()
  }

  public async onBoundWitnessSuccess(boundWitness: IXyoBoundWitness): Promise<void> {
    const hashValue = await this.hashingProvider.createHash(boundWitness.getSigningData())

    try {
      await this.boundWitnessValidator.validateBoundWitness(hashValue, boundWitness)
      this.logInfo(`Bound Witness Validated`)
    } catch (err) {
      this.logError(`Origin block failed validation. Will not add.`, err)
      throw err
    }

    await this.originChainRepository.updateOriginChainState(hashValue, boundWitness)
    await this.originBlockRepository.addOriginBlock(hashValue, boundWitness)
    const nestedBoundWitnesses = new XyoNestedBoundWitnessExtractor().extractNestedBoundWitnesses(boundWitness)

    await nestedBoundWitnesses.reduce(async (promiseChain, nestedBoundWitness) => {
      await promiseChain
      const nestedHashValue = await this.hashingProvider.createHash(nestedBoundWitness.getSigningData())
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

        await this.originBlockRepository.addOriginBlock(nestedHashValue, nestedBoundWitness, hashValue)
      }
    }, Promise.resolve() as Promise<void>)

    return
  }
}
