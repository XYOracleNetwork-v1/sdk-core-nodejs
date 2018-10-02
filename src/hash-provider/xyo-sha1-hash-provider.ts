/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 10:57:26 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-sha1-hash-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 5:01:37 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSha1Hash } from '../components/hashing/xyo-sha1-hash';
import { XyoNativeBaseHashProvider } from './xyo-native-base-hash-provider';

/**
 * Provides sha1 hash support
 */

export class XyoSha1HashProvider extends XyoNativeBaseHashProvider {

  /**
   * Creates a new instance of a XyoSha1HashProvider
   */

  constructor() {
    super('sha1', { newInstance: (hashProvider, hash) => new XyoSha1Hash(hashProvider, hash) });
  }
}
