/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 1:32:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-strong-array.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 22nd August 2018 2:46:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { loadAllTypes } from '../test-utils';
import { XYOStrongArray } from '../../src/components/arrays/xyo-strong-array';
import { XYORssi } from '../../src/components/heuristics/numbers/signed/xyo-rssi';

describe(`XYOStrongArray`, () => {
  beforeAll(() => {
    loadAllTypes();
  });

  it(`serialize and deserialize XYOStrongArray type`, () => {
    const expected = Buffer.from([
      0x00, 0x00, 0x00, 0x0d,
      0x02, 0x03,
      0x00, 0x00, 0x00, 0x03,
      0x00,
      0x01,
      0x02
    ]);

    const rssiArray = new XYOStrongArray(0x02, 0x03);
    rssiArray.addElement(new XYORssi(0));
    rssiArray.addElement(new XYORssi(1));
    rssiArray.addElement(new XYORssi(2));

    const untypedRssi = rssiArray.unTyped;

    expect(expected.equals(untypedRssi)).toBe(true);
  });
});
