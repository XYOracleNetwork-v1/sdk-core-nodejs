/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 12th October 2018 9:54:04 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 12th October 2018 11:47:40 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSigner, IXyoSignerProvider } from "../../@types/xyo-signing";
import { XyoObject } from "../../xyo-core-components/xyo-object";
import { XyoDefaultPackerProvider } from "../../xyo-serialization/xyo-default-packer-provider";
import { XyoEcdsaSecp256k1Sha256SignerProvider } from "../ecdsa/secp256k1/sha256/xyo-ecdsa-secp256k1-sha256-signer-provider";
import { XyoSha256HashProvider } from "../../xyo-hashing/sha256/xyo-sha256-hash-provider";
import { XyoRsaSha1SignerProvider } from "../rsa/sha1/xyo-rsa-sha1-signer-provider";
import { XyoRsaSha256SignerProvider } from "../rsa/sha256/xyo-rsa-sha256-signer-provider";
import { XyoEcdsaSecp256k1Sha1SignerProvider } from "../ecdsa/secp256k1/sha1/xyo-ecdsa-secp256k1-sha1-signer-provider";
import { XyoSha1HashProvider } from "../../xyo-hashing/sha1/xyo-sha1-hash-provider";

/**
 * A very basic test against Xyo-Signers and Xyo-Signer-Providers.
 * This can be extended to support future Signer-Providers
 */

// Initialize packing scheme
XyoObject.packer = new XyoDefaultPackerProvider().getXyoPacker();

// Some of the signer-providers rely on hashing services, initialize here
const sha256HashProvider = new XyoSha256HashProvider();
const sha1HashProvider = new XyoSha1HashProvider();

// List of signer-providers that should be tested initialized here. Can be extended
const signerProviders: IXyoSignerProvider[] = [
  new XyoEcdsaSecp256k1Sha256SignerProvider(sha256HashProvider),
  new XyoRsaSha1SignerProvider(),
  new XyoRsaSha256SignerProvider(),
  new XyoEcdsaSecp256k1Sha1SignerProvider(sha1HashProvider)
];

// Wrap in `XyoSignerProviders` spec
describe(`XyoSignerProviders`, () => {
  signerProviders.map(signerSpec); // Create a signer-spec for each signer-provider dynamically
});

// The spec below is written against the interface of a IXyoSignerProvider and IXyoSigner
function signerSpec(signerProvider: IXyoSignerProvider) {
  let signer: IXyoSigner;

  describe(signerProvider.constructor.name, () => {
    beforeEach(() => {
      signer = signerProvider.newInstance();
    });

    it(`Should sign and verify correct data, and not verify bad data`, async () => {
      const data = Buffer.from('hello world');
      const signature = await signer!.signData(data);
      const shouldVerifyResult = await signature.verify(data, signer.publicKey);

      expect(shouldVerifyResult).toBe(true);

      const shouldNotVerifyResult = await signature.verify(Buffer.from('wrong data'), signer.publicKey);
      expect(shouldNotVerifyResult).toBe(false);
    });
  });
}
