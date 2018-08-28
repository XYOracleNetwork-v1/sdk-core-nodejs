/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:53:01 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash-creator.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 9:00:18 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { loadAllTypes } from '../test-utils';
import { XyoObjectCreator } from '../../src/components/xyo-object-creator';
import { XyoHashCreator } from '../../src/components/hashing/xyo-hash';

describe(`XyoHashCreator`, () => {
  beforeAll(() => {
    loadAllTypes();
  });

  it(`Should be able create and verify an arbitrary hash`, () => {
    const dataToHash = Buffer.from([0x13, 0x37]);

    const hashCreator = XyoObjectCreator.getCreator(0x04, 0x0b) as XyoHashCreator;
    if (!hashCreator) {
      throw new Error(`HashCreator is null, expected to receive a hash-creator instance`);
    }

    const hash = hashCreator.createHash(dataToHash);
    const verify = hash.verifyHash(dataToHash);
    expect(verify).toBe(true);
  });
});
