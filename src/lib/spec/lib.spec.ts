/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 14th November 2018 1:43:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: lib.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 1:52:10 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { getHashingProvider, HASH_TYPE } from '../index';

describe(`Library Export Spec`, () => {
  it(`Should return a hashProvider`, () => {
    ['sha256', 'sha512', 'md5', 'sha1', 'sha224'].forEach((supportedHashType) => {
      const hashProvider = getHashingProvider(supportedHashType as HASH_TYPE);
      expect(hashProvider).toBeDefined();
    });

    expect(() => getHashingProvider('doesNotExist' as HASH_TYPE)).toThrow();
  });
});
