/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 2:04:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 13th December 2018 10:49:46 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSecp256k1SignerProvider } from './xyo-ecdsa-secp256k1-signer-provider'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { getHashingProvider } from '@xyo-network/hashing'
import { schema } from '@xyo-network/serialization-schema'
import { XyoEcdsaSignature } from './xyo-ecdsa-signature'
import { XyoEcdsaSignatureDeserializer } from './xyo-ecdsa-signature-deserializer'
import { XyoEcdsaUncompressedPublicKeyDeserializer } from './xyo-ecdsa-uncompressed-public-key-deserializer'
import { XyoEcdsaSecp256k1UnCompressedPublicKey } from './xyo-ecdsa-secp256k1-uncompressed-public-key'
import { IXyoDeserializer, IXyoSerializationService } from '@xyo-network/serialization'
import { XyoEcdsaSecp256k1Signer } from './xyo-ecdsa-secp256k1-signer'

/** The types of signing algorithm supported */
type SignerProviderType = (
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
    case 'secp256k1-sha256':
      const sha256HashingProvider = getHashingProvider('sha256')
      signerProvider = new XyoEcdsaSecp256k1SignerProvider(
        sha256HashingProvider,
        schema.ecSecp256k1UncompressedPublicKey.id,
        schema.ecdsaSecp256k1WithSha256Signature.id
      )
      break
    default:
      throw new XyoError(`Could not resolve signer provider type ${signerProviderType}`, XyoErrors.INVALID_PARAMETERS)
  }

  return signerProvider
}

export { XyoEcdsaSignature } from './xyo-ecdsa-signature'
export { XyoEcdsaSecp256k1UnCompressedPublicKey } from './xyo-ecdsa-secp256k1-uncompressed-public-key'

XyoEcdsaSignature.deserializer = new XyoEcdsaSignatureDeserializer(
  schema.ecdsaSecp256k1WithSha256Signature.id,
  getSignerProvider('secp256k1-sha256')
)

XyoEcdsaSecp256k1UnCompressedPublicKey.deserializer = new XyoEcdsaUncompressedPublicKeyDeserializer(
  schema.ecSecp256k1UncompressedPublicKey.id
)

class XyoEcdsaSecp256k1SignerDeserializer implements IXyoDeserializer<XyoEcdsaSecp256k1Signer> {
  public readonly schemaObjectId = schema.ecdsaSecp256k1WithSha256Signer.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoEcdsaSecp256k1Signer {
    const parseData = serializationService.parse(data)
    const privateKeyHex = parseData.dataBytes.toString()
    const signerProvider = getSignerProvider('secp256k1-sha256')
    return signerProvider.newInstance(privateKeyHex)
  }
}

XyoEcdsaSecp256k1Signer.deserializer = new XyoEcdsaSecp256k1SignerDeserializer()

export { XyoEcdsaSecp256k1Signer } from './xyo-ecdsa-secp256k1-signer'
