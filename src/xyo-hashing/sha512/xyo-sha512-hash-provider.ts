/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 11:00:10 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-sha512-hash-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 11:37:33 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSha512Hash } from './xyo-sha512-hash';
import { XyoNativeBaseHashProvider } from '../xyo-native-base-hash-provider';

/**
 * Provides sha512 hash support
 */

export class XyoSha512HashProvider extends XyoNativeBaseHashProvider {

  /**
   * Creates a new instance of a XyoSha512HashProvider
   */

  constructor() {
    super('sha512', { newInstance: (hashProvider, hash) => new XyoSha512Hash(hashProvider, hash) });
  }
}
