/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 10:23:05 am
 * @Email:  developer@xyfindables.com
 * @Filename: rsa-sha256-serializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 20th September 2018 4:58:22 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoDefaultPackerProvider } from '../../xyo-packer/xyo-default-packer-provider';
import { XyoEcSecp256kSignerProvider } from '../../signing/xyo-ec-secp-256k-signer-provider';
import { XyoSha256HashProvider } from '../../hash-provider/xyo-sha256-hash-provider';
import { XyoEcdsaSignature } from '../../components/signing/algorithms/ecc/xyo-ecdsa-signature';
import { XyoEcSecp256k } from '../../components/signing/algorithms/ecc/xyo-ec-secp-256k';

describe('XyoEcSecp256kSignerSerializer', () => {
  it('Should serialize and deserialize rEcSecp256kS signers', async () => {
    const packer = new XyoDefaultPackerProvider().getXyoPacker();
    const sha256HashProvider = new XyoSha256HashProvider();
    const signerProvider = new XyoEcSecp256kSignerProvider(sha256HashProvider, 0x06, 0x01, 0x05, 0x01);
    const signer = signerProvider.newInstance();
    const sig1 = (await signer.signData(Buffer.from('hello world'))) as XyoEcdsaSignature;
    const typedSerialization = packer.serialize(signer, signer.major, signer.minor, true);
    const hydratedSigner = packer.deserialize(typedSerialization) as XyoEcSecp256k;
    expect(signer.publicKey.x.equals(hydratedSigner.publicKey.x)).toBe(true);
    expect(signer.publicKey.y.equals(hydratedSigner.publicKey.y)).toBe(true);
    expect(signer.privateKey === hydratedSigner.privateKey).toBe(true);

    const sig2 = (await hydratedSigner.signData(Buffer.from('hello world'))) as XyoEcdsaSignature;
  });
});
