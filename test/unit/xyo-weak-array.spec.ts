/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 2:46:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-weak-array.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 22nd August 2018 2:49:13 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { loadAllTypes } from '../test-utils';
import { XYOWeakArray } from '../../src/components/arrays/xyo-weak-array';
import { XYORssi } from '../../src/components/heuristics/numbers/signed/xyo-rssi';

describe(`XYOWeakArray`, () => {
  beforeAll(() => {
    loadAllTypes();
  });

  it(`serialize and deserialize XYOStrongArray type`, () => {
    const expected = Buffer.from([
      0x00, 0x00, 0x00, 0x11, // 17 elements total
      0x00, 0x00, 0x00, 0x03, // 3 elements total
      0x02, 0x03, // first element is an rssi
      0x00, // with value 0
      0x02, 0x03, // second element is an rssi
      0x01, // with value 1
      0x02, 0x03, // third element is an rssi
      0x02 // with value 2
    ]);

    const rssiArray = new XYOWeakArray();
    rssiArray.addElement(new XYORssi(0));
    rssiArray.addElement(new XYORssi(1));
    rssiArray.addElement(new XYORssi(2));

    const untypedRssi = rssiArray.unTyped;

    expect(expected.equals(untypedRssi)).toBe(true);
  });
});
