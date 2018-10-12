/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 12th October 2018 11:11:15 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 12th October 2018 11:32:16 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHashProvider } from "../../@types/xyo-hashing";
import { XyoMd5HashProvider } from "../md5/xyo-md5-hash-provider";
import { XyoSha1HashProvider } from "../sha1/xyo-sha1-hash-provider";
import { XyoSha256HashProvider } from "../sha256/xyo-sha256-hash-provider";
import { XyoSha224HashProvider } from "../sha224/xyo-sha224-hash-provider";
import { XyoSha512HashProvider } from "../sha512/xyo-sha512-hash-provider";
import { XyoObject } from "../../xyo-core-components/xyo-object";
import { XyoDefaultPackerProvider } from "../../xyo-serialization/xyo-default-packer-provider";

function hashSpec(hashProvider: IXyoHashProvider) {

  describe(hashProvider.constructor.name, () => {
    it(`Should verify correct hashes and not verify incorrect hashes`, async () => {
      const dataToHash = Buffer.from(`hello world`);
      const hash = await hashProvider.createHash(dataToHash);

      const correctResult = await hash.verifyHash(dataToHash);
      expect(correctResult).toBe(true);

      const incorrectResult = await hash.verifyHash(Buffer.from('fee phi pho fum'));
      expect(incorrectResult).toBe(false);
    });

    it(`Should have deterministic hashes`, async () => {
      const dataToHash = Buffer.from(`hello world`);
      const hash1 = await hashProvider.createHash(dataToHash);
      const hash2 = await hashProvider.createHash(dataToHash);
      expect(hash1.isEqual(hash2)).toBe(true);
    });

    it(`XyoHashes should serialize/deserialize`, async () => {
      const dataToHash = Buffer.from(`hello world`);
      const hash1 = await hashProvider.createHash(dataToHash);
      const serializedHash1 = hash1.serialize(true);
      const hash2 = XyoObject.deserialize(serializedHash1);
      expect(hash1.isEqual(hash2)).toBe(true);
    });

    it(`Should have different outputs for very-close inputs`, async () => {
      const dataToHash = Buffer.from(`hello world`);
      const hash1 = await hashProvider.createHash(dataToHash);

      const dataToHash2 = Buffer.from(`Hello world`); // with capital H
      const hash2 = await hashProvider.createHash(dataToHash2);
      expect(hash1.isEqual(hash2)).toBe(false);
    });
  });
}

XyoObject.packer = new XyoDefaultPackerProvider().getXyoPacker();

const hashProvidersToTest: IXyoHashProvider[] = [
  new XyoMd5HashProvider(),
  new XyoSha1HashProvider(),
  new XyoSha256HashProvider(),
  new XyoSha224HashProvider(),
  new XyoSha512HashProvider()
];

describe(`XyoHashProvider`, () => {
  hashProvidersToTest.map(hashSpec);
});
