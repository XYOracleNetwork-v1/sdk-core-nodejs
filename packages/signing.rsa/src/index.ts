/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 3:24:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 5:37:38 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaShaSignerProvider } from "./xyo-rsa-sha-signer-provider"
import { XyoError, XyoErrors } from '@xyo-network/errors'

const SCHEMA_ID_RSA_WITH_SHA256_SIGNATURE = 0x13

/** The types of signing algorithm supported */
export type SignerProviderType = (

  /** Will hash the data using sha256 before signing */
  'rsa-sha256'
)

const signerProviderCache: {[s: string]: XyoRsaShaSignerProvider} = {}

/**
 * Gets an instance of a `XyoRsaShaSignerProvider` signer provider
 *
 * @export
 * @param {SignerProviderType} signerProviderType
 * @returns {XyoRsaShaSignerProvider}
 */
export function getSignerProvider(signerProviderType: SignerProviderType): XyoRsaShaSignerProvider {
  if (signerProviderCache[signerProviderType]) {
    return signerProviderCache[signerProviderType]
  }

  let signerProvider: XyoRsaShaSignerProvider
  switch (signerProviderType) {
    case 'rsa-sha256':
      signerProvider = new XyoRsaShaSignerProvider("pkcs1-sha256", SCHEMA_ID_RSA_WITH_SHA256_SIGNATURE)
      break
    default:
      throw new XyoError(`Could not resolve signer provider type ${signerProviderType}`, XyoErrors.INVALID_PARAMETERS)
  }

  return signerProvider
}
