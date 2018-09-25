/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 10:54:53 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-md5-hash-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 18th September 2018 11:07:49 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoMd5Hash } from '../components/hashing/xyo-md5-hash';
import { XyoNativeBaseHashProvider } from './xyo-native-base-hash-provider';

/**
 * Provides md5 hash support
 */

export class XyoMd5HashProvider extends XyoNativeBaseHashProvider {

  /**
   * Creates a new instance of a XyoMd5HashProvider
   */

  constructor() {
    super('md5', XyoMd5Hash);
  }
}
