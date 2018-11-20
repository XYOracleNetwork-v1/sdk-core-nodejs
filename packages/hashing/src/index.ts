/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 1:46:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 2:01:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHashProvider } from './@types'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { XyoNativeBaseHashProvider } from './xyo-native-base-hash-provider'

export { IXyoHash, IXyoHashProvider } from './@types'

/**
 * The currently natively supported hash-types in the XYO protocol
 */
export type HASH_TYPE = 'sha256' | 'sha512' | 'md5' | 'sha1' | 'sha224'

/** A cache fro the hash-providers */
const hashProvidersByType: {[h: string]: IXyoHashProvider } = {}

/**
 * Gets a HashProvider given a hashType
 *
 * @export
 * @param {HASH_TYPE} hashType 'sha256' | 'sha512' | 'md5' | 'sha1' | 'sha224'
 * @returns {IXyoHashProvider} An instance of a `IXyoHashProvider`
 */

export function getHashingProvider(hashType: HASH_TYPE): IXyoHashProvider {
  if (['sha256', 'sha512', 'md5', 'sha1', 'sha224'].indexOf(hashType) === -1) {
    throw new XyoError(`Unsupported hash type ${hashType}`, XyoErrors.CRITICAL)
  }

  if (hashProvidersByType[hashType]) {
    return hashProvidersByType[hashType]
  }

  let hashProvider: IXyoHashProvider | undefined

  switch (hashType) {
    case "sha256":
      hashProvider = new XyoNativeBaseHashProvider('sha256')
      break
    case "sha512":
      hashProvider = new XyoNativeBaseHashProvider('sha512')
      break
    case "md5":
      hashProvider = new XyoNativeBaseHashProvider('md5')
      break
    case "sha1":
      hashProvider = new XyoNativeBaseHashProvider('sha1')
      break
    case "sha224":
      hashProvider = new XyoNativeBaseHashProvider('sha224')
      break
    default:
      throw new XyoError(`This should never happen`, XyoErrors.CRITICAL)
  }

  hashProvidersByType[hashType] = hashProvider

  return hashProvider
}
