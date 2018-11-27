/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 3:24:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 4:56:17 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaShaSignerProvider } from "./xyo-rsa-sha-signer-provider"
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { schema } from '@xyo-network/object-schema'

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
      signerProvider = new XyoRsaShaSignerProvider("pkcs1-sha256", schema.rsaWithSha256Signature.id)
      break
    default:
      throw new XyoError(`Could not resolve signer provider type ${signerProviderType}`, XyoErrors.INVALID_PARAMETERS)
  }

  return signerProvider
}
