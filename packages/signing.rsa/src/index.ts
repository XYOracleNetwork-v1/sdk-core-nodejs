/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 3:24:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 12:19:58 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaShaSignerProvider } from "./xyo-rsa-sha-signer-provider"
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { schema } from '@xyo-network/serialization-schema'
import { IXyoDeserializer, IXyoSerializationService } from "@xyo-network/serialization"
import { XyoRsaSignature } from "./rsa-signature"

/** The types of signing algorithm supported */
type SignerProviderType = (

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

class XyoRsaWithSha256Signature implements IXyoDeserializer<XyoRsaSignature> {
  public schemaObjectId = schema.rsaWithSha256Signature.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoRsaSignature {
    const parseResult = serializationService.parse(data)
    const signerProvider = getSignerProvider('rsa-sha256')
    return new XyoRsaSignature(
      parseResult.data as Buffer,
      signerProvider.verifySign.bind(signerProvider),
      this.schemaObjectId
    )
  }
}

export const rsaWithSha256SignatureDeserializer = new XyoRsaWithSha256Signature()

export { XyoRsaPublicKey } from './xyo-rsa-public-key'
