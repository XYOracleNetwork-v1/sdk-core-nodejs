/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 10:23:05 am
 * @Email:  developer@xyfindables.com
 * @Filename: rsa-sha256-serializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 30th October 2018 10:42:07 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoDefaultPackerProvider } from '../../xyo-serialization/xyo-default-packer-provider';
import { XyoSha256HashProvider } from '../../xyo-hashing/sha256/xyo-sha256-hash-provider';
import { XyoEcdsaSignature } from '../ecdsa/signature/xyo-ecdsa-signature';
import { XyoEcdsaSecp256k1Signer } from '../ecdsa/secp256k1/signer/xyo-ecdsa-secp256k1-signer';
import { XyoEcdsaSecp256k1Sha256SignerProvider } from '../ecdsa/secp256k1/sha256/xyo-ecdsa-secp256k1-sha256-signer-provider';
import { XyoObject } from '../../xyo-core-components/xyo-object';

XyoObject.packer = new XyoDefaultPackerProvider().getXyoPacker();
const sha256HashProvider = new XyoSha256HashProvider();
const signerProvider = new XyoEcdsaSecp256k1Sha256SignerProvider(
  sha256HashProvider
);

describe('XyoEcdsaSecp256k1SignerSerializer', () => {

  it('Should serialize and deserialize Ecdsa Secp256k1 signers', async () => {
    const signer = signerProvider.newInstance();
    const sig1 = (await signer.signData(Buffer.from('hello world'))) as XyoEcdsaSignature;
    const typedSerialization = signer.serialize(true);
    const hydratedSigner = XyoObject.deserialize(typedSerialization) as XyoEcdsaSecp256k1Signer;
    expect(signer.publicKey.x.equals(hydratedSigner.publicKey.x)).toBe(true);
    expect(signer.publicKey.y.equals(hydratedSigner.publicKey.y)).toBe(true);
    expect(signer.privateKey === hydratedSigner.privateKey).toBe(true);

    const sig2 = (await hydratedSigner.signData(Buffer.from('hello world'))) as XyoEcdsaSignature;
  });

  it('Should load a private key and verify a signature', async () => {
    const dataToSign = Buffer.from("00", 'hex');

    // tslint:disable-next-line:max-line-length
    const assertedPublic = Buffer.from("DC26168A6630A280E7152FD2749F60BC59EDAC0544276B7F55C91FC57141E4E510D55149DEB84941BC68EC863A9288A65EB485B631F08BD9DC0AA65F5F5E2D12", 'hex');

    // tslint:disable-next-line:max-line-length
    const assertedPrivate = Buffer.from("00DECCC9FA76EF2D0D90D5C5C9807C25E5429C5202D35A8F5D5C9A3CD7DE0B26EF", 'hex');
    const ec = signerProvider.newInstance(assertedPrivate.toString('hex'));
    const sig = await ec.signData(dataToSign);
    expect(assertedPublic.equals(ec.publicKey.serialize(false))).toBe(true);
    expect(await sig.verify(dataToSign, ec.publicKey)).toBe(true);
  });
});
