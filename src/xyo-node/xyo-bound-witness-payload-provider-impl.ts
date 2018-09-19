/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 9:17:55 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-payload-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 2:16:45 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../components/xyo-object';
import { XyoOriginChainStateManager } from '../origin-chain/xyo-origin-chain-state-manager';
import { XyoPayload } from '../components/xyo-payload';
import { XyoMultiTypeArrayInt } from '../components/arrays/xyo-multi-type-array-int';
import { XyoBoundWitnessPayloadProvider } from './xyo-node-types';

export class XyoBoundWitnessPayloadProviderImpl implements XyoBoundWitnessPayloadProvider {

  /** A mapping of name to heuristic-providers */
  private readonly heuristicsProviders: {[s: string]: () => Promise<XyoObject>} = {};

  /**
   * A helper function for composing the payload values that will go
   * inside a bound witness
   */

  public async getPayload(originState: XyoOriginChainStateManager): Promise<XyoPayload> {
    const heuristics = await this.getHeuristics();
    const unsignedPayloads: XyoObject[] = ([] as XyoObject[]).concat(heuristics);
    const signedPayloads: XyoObject[] = [];

    const previousHash = originState.previousHash;
    const index = originState.index;
    const nextPublicKey = originState.nextPublicKey;

    if (previousHash) {
      signedPayloads.push(previousHash);
    }

    if (nextPublicKey) {
      signedPayloads.push(nextPublicKey);
    }

    signedPayloads.push(index);
    return new XyoPayload(
      new XyoMultiTypeArrayInt(signedPayloads),
      new XyoMultiTypeArrayInt(unsignedPayloads)
    );
  }

  /**
   * Register a heuristics provider with the xyo-node. The values of the heuristic
   * provider will be placed in the bound-witness
   *
   * @param name The name of the heuristics provider
   * @param providerFn A callback function that asynchronously returns a value
   */

  public addHeuristicsProvider(name: string, providerFn: () => Promise<XyoObject>) {
    this.heuristicsProviders[name] = providerFn;
  }

  /**
   * Iterates through the heuristics providers and resolves
   * their values
   */

  private async getHeuristics(): Promise<XyoObject[]> {
    if (Object.keys(this.heuristicsProviders).length === 0) {
      return [];
    }

    return Promise.all(
      Object.keys(this.heuristicsProviders).map((heuristicName) => {
        const providerFn = this.heuristicsProviders[heuristicName];
        return providerFn();
      })
    );
  }
}
