/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 10:23:05 am
 * @Email:  developer@xyfindables.com
 * @Filename: rsa-sha256-serializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 12:30:33 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoDefaultPackerProvider } from '../../xyo-packer/xyo-default-packer-provider';
import { XyoRsaSha256Signature } from '../../signing/rsa/xyo-rsa-sha256-signature';
import { XyoRsaSha256SignerProvider } from '../../signing/rsa/xyo-rsa-sha256-signer-provider';
import { XyoRsaSha256Signer } from '../../signing/rsa/xyo-rsa-sha256-signer';

describe('XyoRsaSha256SignerSerializer', () => {
  it('Should serialize and deserialize rsa-sha256 signers', async () => {
    const packer = new XyoDefaultPackerProvider().getXyoPacker();
    const signerProvider = new XyoRsaSha256SignerProvider();
    const signer = signerProvider.newInstance();
    const sig1 = (await signer.signData(Buffer.from('hello world'))) as XyoRsaSha256Signature;
    const typedSerialization = packer.serialize(signer, signer.major, signer.minor, true);
    const hydratedSigner = packer.deserialize(typedSerialization) as XyoRsaSha256Signer;
    expect(signer.publicKey.modulus.equals(hydratedSigner.publicKey.modulus)).toBe(true);
    expect(signer.privateKey === hydratedSigner.privateKey).toBe(true);

    const sig2 = (await hydratedSigner.signData(Buffer.from('hello world'))) as XyoRsaSha256Signature;
    expect(sig2.encodedSignature.equals(sig1.encodedSignature)).toBe(true);
  });
});
