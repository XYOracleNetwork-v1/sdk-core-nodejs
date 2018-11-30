/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 1:46:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 1:11:19 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHashProvider } from './@types'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { XyoNativeBaseHashProvider } from './xyo-native-base-hash-provider'

export { XyoBaseHash } from './xyo-base-hash'
export { IXyoHash, IXyoHashProvider } from './@types'
export { XyoHash } from './xyo-native-base-hash-provider'

const SCHEMA_ID_SHA256 = 0x10

/**
 * The currently natively supported hash-types in the XYO protocol
 */
export type HASH_TYPE = 'sha256'

/** A cache fro the hash-providers */
const hashProvidersByType: {[h: string]: IXyoHashProvider } = {}

/**
 * Gets a HashProvider given a hashType
 *
 * @export
 * @param {HASH_TYPE} hashType 'sha256'
 * @returns {IXyoHashProvider} An instance of a `IXyoHashProvider`
 */

export function getHashingProvider(hashType: HASH_TYPE): IXyoHashProvider {
  if (['sha256'].indexOf(hashType) === -1) {
    throw new XyoError(`Unsupported hash type ${hashType}`, XyoErrors.CRITICAL)
  }

  if (hashProvidersByType[hashType]) {
    return hashProvidersByType[hashType]
  }

  let hashProvider: IXyoHashProvider | undefined

  switch (hashType) {
    case "sha256":
      hashProvider = new XyoNativeBaseHashProvider('sha256', SCHEMA_ID_SHA256)
      break
    default:
      throw new XyoError(`This should never happen`, XyoErrors.CRITICAL)
  }

  hashProvidersByType[hashType] = hashProvider

  return hashProvider
}
