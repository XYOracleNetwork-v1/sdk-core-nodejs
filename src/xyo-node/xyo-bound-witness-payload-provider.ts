/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 9:17:55 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-payload-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 4:55:14 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject, IXyoObject } from '../xyo-core-components/xyo-object';
import { XyoPayload } from '../xyo-bound-witness/components/payload/xyo-payload';
import { XyoMultiTypeArrayInt } from '../xyo-core-components/arrays/multi/xyo-multi-type-array-int';
import { IXyoBoundWitnessPayloadProvider } from '../@types/xyo-node';
import { IXyoOriginChainStateRepository } from '../@types/xyo-origin-chain';
import { XyoMillisecondTime } from '../xyo-core-components/heuristics/numbers/xyo-millisecond-time';

export class XyoBoundWitnessPayloadProvider implements IXyoBoundWitnessPayloadProvider {

  /** A mapping of name to unsigned-heuristic-providers */
  private readonly unsignedHeuristicsProviders: {[s: string]: () => Promise<XyoObject>} = {};

  /** A mapping of name to signed-heuristic-providers */
  private readonly signedHeuristicsProviders: {[s: string]: () => Promise<XyoObject>} = {};

  /**
   * A helper function for composing the payload values that will go
   * inside a bound witness
   */

  public async getPayload(originState: IXyoOriginChainStateRepository): Promise<XyoPayload> {
    const signedHeuristics = await this.getHeuristics(true);
    const unsignedHeuristics = await this.getHeuristics(false);

    const unsignedPayloads: IXyoObject[] = ([] as IXyoObject[]).concat(unsignedHeuristics);
    unsignedPayloads.push(new XyoMillisecondTime()); // add timestamp to unsigned heuristics

    const signedPayloads: IXyoObject[] = ([] as XyoObject[]).concat(signedHeuristics);
    const previousHash = await originState.getPreviousHash();
    const index = await originState.getIndex();
    const nextPublicKey = await originState.getNextPublicKey();

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
   * @param signed true if it should go into the signed payload, false if it should go into the unsigned payload
   * @param providerFn A callback function that asynchronously returns a value
   */

  public addHeuristicsProvider(name: string, signed: boolean, providerFn: () => Promise<XyoObject>) {
    if (signed) {
      this.signedHeuristicsProviders[name] = providerFn;
    } else {
      this.unsignedHeuristicsProviders[name] = providerFn;
    }
  }

  /**
   * Removes a heuristics provider
   * @param name The name of the heuristics provider
   * @param signed true if it should remove from the signed payload, false if it should remove from the unsigned payload
   */

  public removeHeuristicsProvider(name: string, signed: boolean) {
    if (signed) {
      delete this.signedHeuristicsProviders[name];
    } else {
      delete this.unsignedHeuristicsProviders[name];
    }
  }

  /**
   * Iterates through the heuristics providers and resolves
   * their values
   */

  private async getHeuristics(signed: boolean): Promise<XyoObject[]> {
    const heuristicsProvider = signed ? this.signedHeuristicsProviders : this.unsignedHeuristicsProviders;

    if (Object.keys(heuristicsProvider).length === 0) {
      return [];
    }

    return Promise.all(
      Object.keys(heuristicsProvider).map((heuristicName) => {
        const providerFn = heuristicsProvider[heuristicName];
        return providerFn();
      })
    );
  }
}
