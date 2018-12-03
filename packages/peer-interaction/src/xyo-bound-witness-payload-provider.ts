
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 1:25:45 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-wit
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 3:10:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoOriginChainRepository } from "@xyo-network/origin-chain"
import { IXyoBoundWitnessPayloadProvider } from "./@types"
import { XyoBasePayload, IXyoPayload } from "@xyo-network/bound-witness"
import { IXyoSerializableObject } from "@xyo-network/serialization"
import { XyoSerializableNumber } from "@xyo-network/serializers"
import { schema } from '@xyo-network/serialization-schema'

export class XyoBoundWitnessPayloadProvider extends XyoBase implements IXyoBoundWitnessPayloadProvider {

  /** A mapping of name to unsigned-heuristic-providers */
  private readonly unsignedHeuristicsProviders: {[s: string]: () => Promise<IXyoSerializableObject>} = {}

  /** A mapping of name to signed-heuristic-providers */
  private readonly signedHeuristicsProviders: {[s: string]: () => Promise<IXyoSerializableObject>} = {}

  /**
   * A helper function for composing the payload values that will go
   * inside a bound witness
   */

  public async getPayload(originState: IXyoOriginChainRepository): Promise<IXyoPayload> {

    const signedHeuristics = await this.getHeuristics(true)
    const unsignedHeuristics = await this.getHeuristics(false)
    const unsignedPayload = ([] as IXyoSerializableObject[]).concat(unsignedHeuristics)
    const signedPayload: IXyoSerializableObject[] = ([] as IXyoSerializableObject[]).concat(signedHeuristics)
    const previousHash = await originState.getPreviousHash()
    const index = await originState.getIndex()
    const nextPublicKey = await originState.getNextPublicKey()

    if (previousHash) {
      signedPayload.push(previousHash)
    }

    if (nextPublicKey) {
      signedPayload.push(nextPublicKey)
    }

    signedPayload.push(new XyoSerializableNumber(index, false, schema.index.id))

    // tslint:disable-next-line:max-classes-per-file
    class OnTheFlyPayload extends XyoBasePayload {
      public readonly signedPayload = signedPayload
      public readonly unsignedPayload = unsignedPayload
    }

    return new OnTheFlyPayload()
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
