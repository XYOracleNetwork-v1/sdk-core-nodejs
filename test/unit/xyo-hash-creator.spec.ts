/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 10:53:01 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash-creator.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 23rd August 2018 11:42:08 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { loadAllTypes } from '../test-utils';
import { XYOObjectCreator } from '../../src/components/xyo-object-creator';
import { XYOHashCreator } from '../../src/components/hashing/xyo-hash';

describe(`XYOHashCreator`, () => {
  beforeAll(() => {
    loadAllTypes();
  });

  it(`Should be able create and verify an arbitrary hash`, () => {
    const dataToHash = Buffer.from([0x13, 0x37]);

    const hashCreator = XYOObjectCreator.getCreator(0x04, 0x0b) as XYOHashCreator;
    if (!hashCreator) {
      throw new Error(`HashCreator is null, expected to receive a hash-creator instance`);
    }

    const hash = hashCreator.createHash(dataToHash);
    const verify = hash.verifyHash(dataToHash);
    expect(verify).toBe(true);
  });
});
