/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th December 2018 12:22:10 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-stub-signer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 14th December 2018 12:31:55 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { signerSpec } from '../xyo-signing-test-utils'
import { XyoStubSigner } from '../xyo-stub-signer'
import { XyoStubPublicKey } from '../xyo-stub-public-key'
import { XyoStubSignature } from '../xyo-stub-signature'
import { IXyoSignature } from '../@types'

describe('StubSigner', () => {
  const validData = Buffer.from('hello world')
  const signer = new XyoStubSigner(
    new XyoStubPublicKey('aabbccdd'),
    new XyoStubSignature('ddccbbaa',  validData)
  )

  signerSpec({
    newInstance: () => signer,
    verifySign: async (signature: IXyoSignature, data: Buffer) => validData.equals(data)
  })
})
