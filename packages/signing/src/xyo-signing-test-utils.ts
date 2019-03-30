import { IXyoSignerProvider, IXyoSigner } from "./@types"

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th December 2018 12:21:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signing-test-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 14th December 2018 12:21:41 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// The spec below is written against the interface of a IXyoSignerProvider and IXyoSigner
export function signerSpec(signerProvider: IXyoSignerProvider) {
  let signer: IXyoSigner

  describe(signerProvider.constructor.name, () => {
    beforeEach(() => {
      signer = signerProvider.newInstance()
    })

    it(`Should sign and verify correct data, and not verify bad data`, async () => {
      const data = Buffer.from('hello world')
      const signature = await signer!.signData(data)
      const shouldVerifyResult = await signature.verify(data, signer.publicKey)

      expect(shouldVerifyResult).toBe(true)

      const shouldNotVerifyResult = await signature.verify(Buffer.from('wrong data'), signer.publicKey)
      expect(shouldNotVerifyResult).toBe(false)
    })
  })
}
