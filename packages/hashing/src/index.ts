/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 1:46:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 9:40:03 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHashProvider, IXyoHash } from './@types'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { XyoNativeBaseHashProvider } from './xyo-native-base-hash-provider'
import { schema } from '@xyo-network/serialization-schema'
import { IXyoDeserializer, parse } from '@xyo-network/serialization'
import { XyoHash } from './xyo-hash'

export { IXyoHash, IXyoHashProvider } from './@types'
export { XyoHash } from './xyo-hash'
export { XyoStubHash } from './xyo-stub-hash'

/**
 * The currently natively supported hash-types in the XYO protocol
 */
type HASH_TYPE = 'sha256'

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
      hashProvider = new XyoNativeBaseHashProvider('sha256', schema.sha256Hash.id)
      break
    default:
      throw new XyoError(`This should never happen`, XyoErrors.CRITICAL)
  }

  hashProvidersByType[hashType] = hashProvider

  return hashProvider
}

class XyoSha256HashDeserializer implements IXyoDeserializer<IXyoHash> {
  public schemaObjectId = schema.sha256Hash.id

  public deserialize(data: Buffer): IXyoHash {
    const parseResult = parse(data)
    const hashProvider = getHashingProvider('sha256')
    return new XyoHash(
      parseResult.data as Buffer,
      hashProvider,
      this.schemaObjectId
    )
  }
}

export const sha256HashDeserializer = new XyoSha256HashDeserializer()
