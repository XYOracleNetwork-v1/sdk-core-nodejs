/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th December 2018 12:33:07 pm
 * @Email:  developer@xyfindables.com
 * @Filename: ecdsa-signer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 14th December 2018 12:36:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { signerSpec } from '@xyo-network/signing'
import { XyoEcdsaSecp256k1SignerProvider } from '../xyo-ecdsa-secp256k1-signer-provider'
import { getHashingProvider } from '@xyo-network/hashing'
import { schema } from '@xyo-network/serialization-schema'

describe('ECDSA signer', () => {
  const hasher = getHashingProvider('sha256')
  const signerProvider = new XyoEcdsaSecp256k1SignerProvider(
    hasher,
    schema.ecSecp256k1UncompressedPublicKey.id,
    schema.ecdsaSecp256k1WithSha256Signature.id
  )

  signerSpec(signerProvider)
})
