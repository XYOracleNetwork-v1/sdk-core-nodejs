/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 2:17:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object-creator.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 30th August 2018 1:32:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObjectCreator } from '../../components/xyo-object-creator';
import { XyoObject } from '../../components/xyo-object';
import { XyoResult } from '../../components/xyo-result';

describe(`XyoObjectCreator`, () => {
  it(`Should register XyoObjectCreator subclass`, () => {
    const testCreatorFixed = new TestObjectCreator();
    testCreatorFixed.enable();
    const dummy = new DummyXyoObject(
      Buffer.from([0x13, 0x37]),
      null,
      Buffer.from([0x23, 0x03])
    );

    const other = XyoObjectCreator.create(dummy.typed.value!);
    expect(other!.data.value!.equals(dummy.data.value!)).toEqual(true);
    expect(other!.id).toEqual(dummy.id);
  });
});

class TestObjectCreator extends XyoObjectCreator {
  public sizeOfBytesToGetSize = XyoResult.withValue(null);

  public major: number = 0x23;
  public minor: number = 0x03;

  public readSize (buffer: Buffer) {
    return XyoResult.withValue(2);
  }

  public createFromPacked(data: Buffer) {
    const b = new Buffer(2);
    b[0] = data[2];
    b[1] = data[3];
    return XyoResult.withValue(new DummyXyoObject(
      b,
      null,
      Buffer.from([data[0], data[1]])
    ));
  }
}

// tslint:disable-next-line:max-classes-per-file
class DummyXyoObject extends XyoObject {
  constructor(
    public readonly rawData: Buffer,
    public readonly sizeIdentifierSizeRaw: number | null,
    public readonly rawId: Buffer) {
    super();
  }

  get sizeIdentifierSize() {
    return XyoResult.withValue(this.sizeIdentifierSizeRaw);
  }

  get data () {
    return XyoResult.withValue(this.rawData);
  }

  get id () {
    return XyoResult.withValue(this.rawId);
  }

}
