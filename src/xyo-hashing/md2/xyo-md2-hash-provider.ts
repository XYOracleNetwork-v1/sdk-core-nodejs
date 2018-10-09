/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 10:54:53 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-md2-hash-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 11:20:21 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoMd2Hash } from './xyo-md2-hash';
import { XyoNativeBaseHashProvider } from '../xyo-native-base-hash-provider';

/**
 * Provides md2 hash support
 */

export class XyoMd2HashProvider extends XyoNativeBaseHashProvider {

  /**
   * Creates a new instance of a XyoMd2HashProvider
   */

  constructor() {
    super('md2', { newInstance: (hashProvider, hash) => new XyoMd2Hash(hashProvider, hash) });
  }
}
