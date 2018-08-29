/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 1:12:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 3:59:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../components/xyo-object';
import { XyoResult } from '../../components/xyo-result';

describe(`XyoObject`, () => {
  it(`Should serialize correctly`, () => {
    const data = new Buffer(8);
    data.writeUInt32BE(Math.pow(2, 16), 0);
    data.writeUInt32BE(Math.pow(2, 16), 4);
    const example = new ExampleXyoObject(data, 4, Buffer.from([0x33, 0X11]));

    const typed = example.typed;
    const untyped = example.unTyped;

    expect(typed.value!.length - 2).toEqual(untyped.value!.length);

    const subTyped = Buffer.from(typed.value!, 2, untyped.value!.length);

    expect(subTyped.equals(untyped.value!));
  });
});

class ExampleXyoObject extends XyoObject {

  constructor(
    public readonly rawData: Buffer,
    public readonly rawSizeIdentifierSize: number,
    public readonly rawId: Buffer) {
    super();
  }

  get sizeIdentifierSize () {
    return XyoResult.withResult(this.rawSizeIdentifierSize);
  }

  get data() {
    return XyoResult.withResult(this.rawData);
  }

  get id () {
    return XyoResult.withResult(this.rawId);
  }
}