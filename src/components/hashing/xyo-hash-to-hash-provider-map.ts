/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Sunday, 16th September 2018 8:31:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash-to-hash-provider-map.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 4:58:25 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHashProvider } from '../../hash-provider/xyo-hash-provider';

/**
 * A helper class to map a hash to a hash-provider
 */
export class XyoHashToHashProviderMap {

  /** A major/minor mapping correspond to xyo-hash type to a hash-provider */
  private providersMap: {[s: string]: {[s: string]: XyoHashProvider}} = {};

  /**
   * Adds a hash provider the registry
   * @param major The major of the XyoHash
   * @param minor The minor of the XyoHash
   * @param hashProvider The provider that knows how verify the corresponding hash type
   */

  public registerHashProvider(major: number, minor: number, hashProvider: XyoHashProvider) {
    this.providersMap[major] = this.providersMap[major] || {};
    this.providersMap[major][minor] = hashProvider;
  }

  /**
   * Given a major and minor that exists in the registry, returns a XyoHashProvider
   * @param major The major value
   * @param minor The minor value
   * @returns Returns the `XyoHashProvider` if it exists, undefined otherwise
   */

  public getProvider(major: number, minor: number): XyoHashProvider | undefined {
    const majorMap = this.providersMap[major];
    if (!majorMap) {
      return undefined;
    }

    return majorMap[minor];
  }
}
