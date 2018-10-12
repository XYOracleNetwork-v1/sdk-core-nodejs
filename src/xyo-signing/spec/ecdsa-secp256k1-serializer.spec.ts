/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 10:23:05 am
 * @Email:  developer@xyfindables.com
 * @Filename: rsa-sha256-serializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 12th October 2018 9:37:15 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoDefaultPackerProvider } from '../../xyo-serialization/xyo-default-packer-provider';
import { XyoSha256HashProvider } from '../../xyo-hashing/sha256/xyo-sha256-hash-provider';
import { XyoEcdsaSignature } from '../ecdsa/signature/xyo-ecdsa-signature';
import { XyoEcdsaSecp256k1Signer } from '../ecdsa/secp256k1/signer/xyo-ecdsa-secp256k1-signer';
import { XyoEcdsaSecp256k1Sha256SignerProvider } from '../ecdsa/secp256k1/sha256/xyo-ecdsa-secp256k1-sha256-signer-provider';
import { XyoObject } from '../../xyo-core-components/xyo-object';

describe('XyoEcdsaSecp256k1SignerSerializer', () => {
  it('Should serialize and deserialize Ecdsa Secp256k1 signers', async () => {
    XyoObject.packer = new XyoDefaultPackerProvider().getXyoPacker();
    const sha256HashProvider = new XyoSha256HashProvider();
    const signerProvider = new XyoEcdsaSecp256k1Sha256SignerProvider(
      sha256HashProvider
    );

    const signer = signerProvider.newInstance();
    const sig1 = (await signer.signData(Buffer.from('hello world'))) as XyoEcdsaSignature;
    const typedSerialization = signer.serialize(true);
    const hydratedSigner = XyoObject.deserialize(typedSerialization) as XyoEcdsaSecp256k1Signer;
    expect(signer.publicKey.x.equals(hydratedSigner.publicKey.x)).toBe(true);
    expect(signer.publicKey.y.equals(hydratedSigner.publicKey.y)).toBe(true);
    expect(signer.privateKey === hydratedSigner.privateKey).toBe(true);

    const sig2 = (await hydratedSigner.signData(Buffer.from('hello world'))) as XyoEcdsaSignature;
  });
});
