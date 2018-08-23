/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 1:12:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 22nd August 2018 2:02:48 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOObject } from '../../src/components/xyo-object';

describe(`XYOObject`, () => {
  it(`Should serialize correctly`, () => {
    const data = new Buffer(8);
    data.writeUInt32BE(Math.pow(2, 16), 0);
    data.writeUInt32BE(Math.pow(2, 16), 4);
    const example = new ExampleXYOObject(data, 4, Buffer.from([0x33, 0X11]));

    const typed = example.typed;
    const untyped = example.unTyped;

    expect(typed.length - 2).toEqual(untyped.length);

    const subTyped = Buffer.from(typed, 2, untyped.length);

    expect(subTyped.equals(untyped));
  });
});

class ExampleXYOObject extends XYOObject {

  constructor(
    public readonly data: Buffer,
    public readonly sizeIdentifierSize: number,
    public readonly id: Buffer) {
    super();
  }
}
