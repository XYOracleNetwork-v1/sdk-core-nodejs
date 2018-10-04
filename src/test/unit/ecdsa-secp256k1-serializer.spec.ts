/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 10:23:05 am
 * @Email:  developer@xyfindables.com
 * @Filename: rsa-sha256-serializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 12:31:11 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoDefaultPackerProvider } from '../../xyo-packer/xyo-default-packer-provider';
import { XyoSha256HashProvider } from '../../hash-provider/xyo-sha256-hash-provider';
import { XyoEcdsaSignature } from '../../signing/ecdsa/xyo-ecdsa-signature';
import { XyoEcdsaSecp256k1Signer } from '../../signing/ecdsa/xyo-ecdsa-secp256k1-signer';
import { XyoEcdsaSecp256k1Sha256SignerProvider } from '../../signing/ecdsa/xyo-ecdsa-secp256k1-sha256-signer-provider';

describe('XyoEcdsaSecp256k1SignerSerializer', () => {
  it('Should serialize and deserialize rEcSecp256kS signers', async () => {
    const packer = new XyoDefaultPackerProvider().getXyoPacker();
    const sha256HashProvider = new XyoSha256HashProvider();
    const signerProvider = new XyoEcdsaSecp256k1Sha256SignerProvider(
      sha256HashProvider
    );
    const signer = signerProvider.newInstance();
    const sig1 = (await signer.signData(Buffer.from('hello world'))) as XyoEcdsaSignature;
    const typedSerialization = packer.serialize(signer, signer.major, signer.minor, true);
    const hydratedSigner = packer.deserialize(typedSerialization) as XyoEcdsaSecp256k1Signer;
    expect(signer.publicKey.x.equals(hydratedSigner.publicKey.x)).toBe(true);
    expect(signer.publicKey.y.equals(hydratedSigner.publicKey.y)).toBe(true);
    expect(signer.privateKey === hydratedSigner.privateKey).toBe(true);

    const sig2 = (await hydratedSigner.signData(Buffer.from('hello world'))) as XyoEcdsaSignature;
  });
});
