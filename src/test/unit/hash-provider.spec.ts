/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 11:01:53 am
 * @Email:  developer@xyfindables.com
 * @Filename: hash-p
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 9:59:29 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { HashProvider } from '../../components/hash-provider.impl';

const knownHashValues: {[s: string]: Buffer} = {
  password: new Buffer([
    0x5E, 0x88, 0x48, 0x98, 0xDA, 0x28, 0x04, 0x71,
    0x51, 0xD0, 0xE5, 0x6F, 0x8D, 0xC6, 0x29, 0x27,
    0x73, 0x60, 0x3D, 0x0D, 0x6A, 0xAB, 0xBD, 0xD6,
    0x2A, 0x11, 0xEF, 0x72, 0x1D, 0x15, 0x42, 0xD8
  ])
};

describe(`HashProvider`, () => {
  it(`Should hash to known hashes`, async () => {
    return Promise.all(
      Object.keys(knownHashValues).map(async (key) => {
        const hashProvider = new HashProvider();
        const knownHash = knownHashValues[key];
        const passwordHash = await hashProvider.hash(Buffer.from(key));
        expect(passwordHash).toEqual(knownHash);
        expect(hashProvider.verifyHash(Buffer.from(key), passwordHash));
        return;
      })
    );
  });

  it(`Should return false when two hashes do not match`, async () => {
    const hashProvider = new HashProvider();
    const verifies = await hashProvider.verifyHash(Buffer.from('hello world'), Buffer.from('wrong hash'));
    expect(verifies).toEqual(false);
  });
});
