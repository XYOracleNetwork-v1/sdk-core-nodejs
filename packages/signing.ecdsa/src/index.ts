/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 2:04:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 3:34:41 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSecp256k1SignerProvider } from './xyo-ecdsa-secp256k1-signer-provider'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { getHashingProvider } from '@xyo-network/hashing'
import { schema } from '@xyo-network/serialization-schema'

/** The types of signing algorithm supported */
export type SignerProviderType = (

  /** Will not hash the data before signing */
  'secp256k1' |

  /** Will hash the data using sha256 before signing */
  'secp256k1-sha256'
)

const signerProviderCache: {[s: string]: XyoEcdsaSecp256k1SignerProvider} = {}

/**
 * Gets an instance of a `EcdsaSecp256k1` signer provider
 * @export
 * @param {SignerProviderType} signerProviderType
 * @returns {XyoEcdsaSecp256k1SignerProvider}
 */
export function getSignerProvider(signerProviderType: SignerProviderType): XyoEcdsaSecp256k1SignerProvider {
  if (signerProviderCache[signerProviderType]) {
    return signerProviderCache[signerProviderType]
  }

  let signerProvider: XyoEcdsaSecp256k1SignerProvider
  switch (signerProviderType) {
    case 'secp256k1':
      signerProvider = new XyoEcdsaSecp256k1SignerProvider(
        undefined,
        schema.ecSecp256k1UncompressedPublicKey.id
      )
      break
    case 'secp256k1-sha256':
      const sha256HashingProvider = getHashingProvider('sha256')
      signerProvider = new XyoEcdsaSecp256k1SignerProvider(
        sha256HashingProvider,
        schema.ecSecp256k1UncompressedPublicKey.id
      )
      break
    default:
      throw new XyoError(`Could not resolve signer provider type ${signerProviderType}`, XyoErrors.INVALID_PARAMETERS)
  }

  return signerProvider
}
