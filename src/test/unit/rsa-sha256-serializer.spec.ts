/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 10:23:05 am
 * @Email:  developer@xyfindables.com
 * @Filename: rsa-sha256-serializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 20th September 2018 10:35:29 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoDefaultPackerProvider } from '../../xyo-packer/xyo-default-packer-provider';
import { XyoRSASha256SignerProvider, XyoRSASha256Signer } from '../../lib';
import { XyoRSASha256Signature } from '../../components/signing/algorithms/rsa/xyo-rsa-sha256-signature';

describe('XyoRsaSha256SignerSerializer', () => {
  it('Should serialize and deserialize rsa-sha256 signers', async () => {
    const packer = new XyoDefaultPackerProvider().getXyoPacker();
    const signerProvider = new XyoRSASha256SignerProvider();
    const signer = signerProvider.newInstance();
    const sig1 = (await signer.signData(Buffer.from('hello world'))) as XyoRSASha256Signature;
    const typedSerialization = packer.serialize(signer, signer.major, signer.minor, true);
    const hydratedSigner = packer.deserialize(typedSerialization) as XyoRSASha256Signer;
    expect(signer.publicKey.modulus.equals(hydratedSigner.publicKey.modulus)).toBe(true);
    expect(signer.privateKey === hydratedSigner.privateKey).toBe(true);

    const sig2 = (await hydratedSigner.signData(Buffer.from('hello world'))) as XyoRSASha256Signature;
    expect(sig2.encodedSignature.equals(sig1.encodedSignature)).toBe(true);
  });
});
