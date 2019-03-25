
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 1:25:45 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-wit
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 10th December 2018 2:26:27 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoOriginChainRepository, XyoIndex, XyoNextPublicKey, XyoPreviousHash } from "@xyo-network/origin-chain"
import { IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessOption } from "./@types"
import { IXyoPayload } from "@xyo-network/bound-witness"
import { CatalogueItem } from '@xyo-network/network'
import { IXyoSerializableObject } from '@xyo-network/serialization'

export class XyoBoundWitnessPayloadProvider extends XyoBase implements IXyoBoundWitnessPayloadProvider {

  /** A mapping of name to unsigned-heuristic-providers */
  private readonly unsignedHeuristicsProviders: {[s: string]: () => Promise<IXyoSerializableObject>} = {}

  /** A mapping of name to signed-heuristic-providers */
  private readonly signedHeuristicsProviders: {[s: string]: () => Promise<IXyoSerializableObject>} = {}

  private boundWitnessOptions: {[key: string]: IXyoBoundWitnessOption} = {}

  /**
   * A helper function for composing the payload values that will go
   * inside a bound witness
   */

  public async getPayload(originState: IXyoOriginChainRepository, choice: CatalogueItem): Promise<IXyoPayload> {
    const signedHeuristics = await this.getHeuristics(true)
    const unsignedHeuristics = await this.getHeuristics(false)
    const unsignedPayload = ([] as IXyoSerializableObject[]).concat(unsignedHeuristics)
    const signedPayload: IXyoSerializableObject[] = ([] as IXyoSerializableObject[]).concat(signedHeuristics)
    const previousHash = await originState.getPreviousHash()
    const index = await originState.getIndex()
    const nextPublicKey = await originState.getNextPublicKey()
    const boundWitnessOptionsSigned = await this.getOptionsSigned(choice)
    const boundWitnessOptionsUnsigned = await this.getOptionsUnsigned(choice)

    if (previousHash) {
      signedPayload.push(new XyoPreviousHash(previousHash))
    }

    if (nextPublicKey) {
      signedPayload.push(new XyoNextPublicKey(nextPublicKey))
    }

    signedPayload.push(new XyoIndex(index))

    boundWitnessOptionsSigned.forEach((item) => {
      signedPayload.push(item)
    })

    boundWitnessOptionsUnsigned.forEach((item) => {
      unsignedPayload.push(item)
    })

    return {
      heuristics: signedPayload,
      metadata: unsignedPayload,
    }
  }

  /**
   * Register a heuristics provider with the xyo-node. The values of the heuristic
   * provider will be placed in the bound-witness
   *
   * @param name The name of the heuristics provider
   * @param signed true if it should go into the signed payload, false if it should go into the unsigned payload
   * @param providerFn A callback function that asynchronously returns a value
   */

  public addHeuristicsProvider(name: string, signed: boolean, providerFn: () => Promise<IXyoSerializableObject>) {
    if (signed) {
      this.signedHeuristicsProviders[name] = providerFn
    } else {
      this.unsignedHeuristicsProviders[name] = providerFn
    }
  }

  /**
   * Removes a heuristics provider
   * @param name The name of the heuristics provider
   * @param signed true if it should remove from the signed payload, false if it should remove from the unsigned payload
   */

  public removeHeuristicsProvider(name: string, signed: boolean) {
    if (signed) {
      delete this.signedHeuristicsProviders[name]
    } else {
      delete this.unsignedHeuristicsProviders[name]
    }
  }

  public addBoundWitnessOption (option: CatalogueItem, boundWitnessOption: IXyoBoundWitnessOption) {
    this.boundWitnessOptions[option] = boundWitnessOption
  }

  public removeBoundWitnessOption (option: CatalogueItem) {
    delete this.boundWitnessOptions[option]
  }

  private async getOptionsSigned (option: CatalogueItem): Promise<IXyoSerializableObject[]> {
    const optionHandler = this.boundWitnessOptions[option]

    if (optionHandler) {
      const signedPayload = await optionHandler.signed()

      if (signedPayload) {
        return [signedPayload]
      }
    }

    return []
  }

  private async getOptionsUnsigned (option: CatalogueItem): Promise<IXyoSerializableObject[]> {
    const optionHandler = this.boundWitnessOptions[option]

    if (optionHandler) {
      const unsignedPayload = await optionHandler.unsigned()

      if (unsignedPayload) {
        return [unsignedPayload]
      }
    }

    return []
  }

  /**
   * Iterates through the heuristics providers and resolves
   * their values
   */

  private async getHeuristics(signed: boolean): Promise<IXyoSerializableObject[]> {
    const heuristicsProvider = signed ? this.signedHeuristicsProviders : this.unsignedHeuristicsProviders

    if (Object.keys(heuristicsProvider).length === 0) {
      return []
    }

    return Promise.all(
      Object.keys(heuristicsProvider).map((heuristicName) => {
        const providerFn = heuristicsProvider[heuristicName]
        return providerFn()
      })
    )
  }
}
