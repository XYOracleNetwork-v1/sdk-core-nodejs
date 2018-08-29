/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 2:17:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object-creator.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 3:59:42 pm
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
  public defaultSize: number = 2;
  public sizeOfSize: number | null = null;

  public major: number = 0x23;
  public minor: number = 0x03;

  public createFromPacked(data: Buffer): XyoObject {
    const b = new Buffer(2);
    b[0] = data[2];
    b[1] = data[3];
    return new DummyXyoObject(
      b,
      null,
      Buffer.from([data[0], data[1]])
    );
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
    return XyoResult.withResult(this.sizeIdentifierSizeRaw);
  }

  get data () {
    return XyoResult.withResult(this.rawData);
  }

  get id () {
    return XyoResult.withResult(this.rawId);
  }

}
