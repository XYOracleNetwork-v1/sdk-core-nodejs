/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 2:17:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object-creator.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 21st August 2018 2:53:25 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOObjectCreator } from '../../src/components/xyo-object-creator';
import { XYOObject } from '../../src/components/xyo-object';

describe(`XYOObjectCreator`, () => {
  it(`Should register XYOObjectCreator subclass`, () => {
    const testCreatorFixed = new TestObjectCreator();
    testCreatorFixed.enable();
    const dummy = new DummyXYOObject(
      Buffer.from([0x13, 0x37]),
      null,
      Buffer.from([0x23, 0x03]).readUInt16BE(0)
    );

    const other = XYOObjectCreator.create(dummy.typed);
    expect(other.data.equals(dummy.data)).toEqual(true);
    expect(other.id).toEqual(dummy.id);
  });
});

class TestObjectCreator extends XYOObjectCreator {
  public defaultSize: number = 2;
  public sizeOfSize: number = null;

  public major: number = 0x23;
  public minor: number = 0x03;

  public createFromPacked(data: Buffer): XYOObject {
    const b = new Buffer(2);
    b[0] = data[2];
    b[1] = data[3];
    return new DummyXYOObject(
      b,
      null,
      data.readUInt16BE(0)
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
class DummyXYOObject extends XYOObject {
  constructor(
    public readonly data: Buffer,
    public readonly sizeIdentifierSize: number,
    public readonly id: number) {
    super();
  }

}
