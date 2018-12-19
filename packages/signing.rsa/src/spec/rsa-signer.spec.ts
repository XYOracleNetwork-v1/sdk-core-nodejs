/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th December 2018 12:37:01 pm
 * @Email:  developer@xyfindables.com
 * @Filename: rsa-signer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 14th December 2018 12:38:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { signerSpec } from '@xyo-network/signing'
import { XyoRsaShaSignerProvider } from '../xyo-rsa-sha-signer-provider'
import { schema } from '@xyo-network/serialization-schema'

describe('RSA signer', () => {
  const signerProvider = new XyoRsaShaSignerProvider("pkcs1-sha256", schema.rsaWithSha256Signature.id)
  signerSpec(signerProvider)
})
