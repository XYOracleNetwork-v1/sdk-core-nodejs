/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 2:46:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-weak-array.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 3:59:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { loadAllTypes } from '../test-utils';
import { XyoWeakArray } from '../../components/arrays/xyo-weak-array';
import { XyoRssi } from '../../components/heuristics/numbers/signed/xyo-rssi';

describe(`XyoWeakArray`, () => {
  beforeAll(() => {
    loadAllTypes();
  });

  it(`serialize and deserialize XyoStrongArray type`, () => {
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

    const rssiArray = new XyoWeakArray();
    rssiArray.addElement(new XyoRssi(0));
    rssiArray.addElement(new XyoRssi(1));
    rssiArray.addElement(new XyoRssi(2));

    const untypedRssi = rssiArray.unTyped.value!;

    expect(expected.equals(untypedRssi)).toBe(true);
  });
});
