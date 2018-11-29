/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 2:04:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 5:40:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSecp256k1SignerProvider } from './xyo-ecdsa-secp256k1-signer-provider'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { getHashingProvider } from '@xyo-network/hashing'

const SCHEMA_ID_EC_SECP256K1_UNCOMPRESSED_PUBLIC_KEY = 0x0d

/** The types of signing algorithm supported */
export type SignerProviderType = (

  /** Will not hash the data before signing */
  'secp256k1' |

  /** Will hash the data using sha1 before signing */
  'secp256k1-sha1' |

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
        SCHEMA_ID_EC_SECP256K1_UNCOMPRESSED_PUBLIC_KEY
      )
      break
    case 'secp256k1-sha1':
      const sha1HashingProvider = getHashingProvider('sha1')
      signerProvider = new XyoEcdsaSecp256k1SignerProvider(
        sha1HashingProvider,
        SCHEMA_ID_EC_SECP256K1_UNCOMPRESSED_PUBLIC_KEY
      )
      break
    case 'secp256k1-sha256':
      const sha256HashingProvider = getHashingProvider('sha256')
      signerProvider = new XyoEcdsaSecp256k1SignerProvider(
        sha256HashingProvider,
        SCHEMA_ID_EC_SECP256K1_UNCOMPRESSED_PUBLIC_KEY
      )
      break
    default:
      throw new XyoError(`Could not resolve signer provider type ${signerProviderType}`, XyoErrors.INVALID_PARAMETERS)
  }

  return signerProvider
}
