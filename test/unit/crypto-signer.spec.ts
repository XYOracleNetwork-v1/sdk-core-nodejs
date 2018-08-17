/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 3:40:12 pm
 * @Email:  developer@xyfindables.com
 * @Filename: crypto-signer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 17th August 2018 3:47:45 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { CryptoSigner } from '../../src/components/crypto-signer.impl';

describe(`CryptoSigner`, () => {
  it(`Should sign and verify data`, async () => {
    const signer = new CryptoSigner();
    const testData = Buffer.from('data 01010111 xyxyo');
    const signature = await signer.sign(testData);

    expect(await signer.verify(testData, signature)).toBe(true);
    expect(await signer.verify(testData, Buffer.from('not signature'))).toBe(false);
  });

  it(`Should encrypt and decrypt data`, async () => {
    const signer = new CryptoSigner();
    const testData = Buffer.from('oyx-xyo');
    const encryptedTestData = await signer.encrypt(testData);

    expect(await signer.decrypt(encryptedTestData)).toEqual(testData);
    expect(await signer.decrypt(encryptedTestData) !== Buffer.from('not decrypted data')).toBe(true);
  });
});
