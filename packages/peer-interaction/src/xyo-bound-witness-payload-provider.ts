
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 1:25:45 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-wit
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 21st November 2018 1:37:31 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoOriginChainRepository } from "@xyo-network/origin-chain"
import { IXyoBoundWitnessPayloadProvider } from "./@types"
import { IXyoPayload } from "@xyo-network/bound-witness"

export class XyoBoundWitnessPayloadProvider extends XyoBase implements IXyoBoundWitnessPayloadProvider {

  /** A mapping of name to unsigned-heuristic-providers */
  private readonly unsignedHeuristicsProviders: {[s: string]: () => Promise<any>} = {}

  /** A mapping of name to signed-heuristic-providers */
  private readonly signedHeuristicsProviders: {[s: string]: () => Promise<any>} = {}

  /**
   * A helper function for composing the payload values that will go
   * inside a bound witness
   */

  public async getPayload(originState: IXyoOriginChainRepository): Promise<IXyoPayload> {

    const signedHeuristics = await this.getHeuristics(true)
    const unsignedHeuristics = await this.getHeuristics(false)
    const unsignedPayload = ([] as any[]).concat(unsignedHeuristics)
    const signedPayload: any[] = ([] as any[]).concat(signedHeuristics)
    const previousHash = await originState.getPreviousHash()
    const index = await originState.getIndex()
    const nextPublicKey = await originState.getNextPublicKey()

    if (previousHash) {
      signedPayload.push(previousHash)
    }

    if (nextPublicKey) {
      signedPayload.push(nextPublicKey)
    }

    signedPayload.push(index)
    const payload: IXyoPayload = {
      signedPayload,
      unsignedPayload
    }
    return payload
  }

  /**
   * Register a heuristics provider with the xyo-node. The values of the heuristic
   * provider will be placed in the bound-witness
   *
   * @param name The name of the heuristics provider
   * @param signed true if it should go into the signed payload, false if it should go into the unsigned payload
   * @param providerFn A callback function that asynchronously returns a value
   */

  public addHeuristicsProvider(name: string, signed: boolean, providerFn: () => Promise<any>) {
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

  private async getHeuristics(signed: boolean): Promise<any[]> {
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
