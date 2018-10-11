/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 10:23:05 am
 * @Email:  developer@xyfindables.com
 * @Filename: rsa-sha256-serializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 4:42:35 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoDefaultPackerProvider } from '../../xyo-serialization/xyo-default-packer-provider';
import { XyoRsaSha256Signature } from '../../xyo-signing/rsa/sha256/xyo-rsa-sha256-signature';
import { XyoRsaSha256SignerProvider } from '../../xyo-signing/rsa/sha256/xyo-rsa-sha256-signer-provider';
import { XyoRsaSha256Signer } from '../../xyo-signing/rsa/sha256/xyo-rsa-sha256-signer';
import { XyoObject } from '../../xyo-core-components/xyo-object';

describe('XyoRsaSha256SignerSerializer', () => {
  it('Should serialize and deserialize rsa-sha256 signers', async () => {
    XyoObject.packer = new XyoDefaultPackerProvider().getXyoPacker();
    const signerProvider = new XyoRsaSha256SignerProvider();
    const signer = signerProvider.newInstance();
    const sig1 = (await signer.signData(Buffer.from('hello world'))) as XyoRsaSha256Signature;
    const typedSerialization = signer.serialize(true);
    const hydratedSigner = XyoObject.deserialize(typedSerialization) as XyoRsaSha256Signer;
    expect(signer.publicKey.modulus.equals(hydratedSigner.publicKey.modulus)).toBe(true);
    expect(signer.privateKey === hydratedSigner.privateKey).toBe(true);

    const sig2 = (await hydratedSigner.signData(Buffer.from('hello world'))) as XyoRsaSha256Signature;
    expect(sig2.encodedSignature.equals(sig1.encodedSignature)).toBe(true);
  });
});
