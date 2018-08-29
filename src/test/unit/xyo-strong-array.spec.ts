/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 1:32:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-strong-array.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 3:59:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { loadAllTypes } from '../test-utils';
import { XyoStrongArray } from '../../components/arrays/xyo-strong-array';
import { XyoRssi } from '../../components/heuristics/numbers/signed/xyo-rssi';

describe(`XyoStrongArray`, () => {
  beforeAll(() => {
    loadAllTypes();
  });

  it(`serialize and deserialize XyoStrongArray type`, () => {
    const expected = Buffer.from([
      0x00, 0x00, 0x00, 0x0d,
      0x02, 0x03,
      0x00, 0x00, 0x00, 0x03,
      0x00,
      0x01,
      0x02
    ]);

    const rssiArray = new XyoStrongArray(0x02, 0x03);
    rssiArray.addElement(new XyoRssi(0));
    rssiArray.addElement(new XyoRssi(1));
    rssiArray.addElement(new XyoRssi(2));

    const untypedRssi = rssiArray.unTyped.value!;

    expect(expected.equals(untypedRssi)).toBe(true);
  });
});