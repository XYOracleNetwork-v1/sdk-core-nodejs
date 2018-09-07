/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 17th September 2018 10:30:46 am
 * @Email:  developer@xyfindables.com
 * @Filename: test-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 4:56:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-classes-per-file

import { XyoObject } from '../components/xyo-object';
import { XYOSerializer } from '../xyo-packer/xyo-serializer';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoArray } from '../components/arrays/xyo-array';
import { XyoArrayUnpacker } from '../xyo-packer/xyo-array-unpacker';

export class TestXyoObject extends XyoObject {

  constructor (public readonly value: string) {
    super(0xFF, 0x00);
  }
}

export class TestXyoObjectSerializer extends XYOSerializer<TestXyoObject> {

  get description() {
    return {
      major: 0xFF,
      minor: 0x00,
      sizeOfBytesToGetSize: 4
    };
  }

  public serialize(testObject: TestXyoObject, xyoPacker: XyoPacker) {
    return Buffer.from(testObject.value);
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const size = buffer.readUInt32BE(0);
    const valueBuffer = buffer.slice(4, 4 + size);
    return new TestXyoObject(valueBuffer.toString());
  }
}

export class TestXyoObjectTypedArray extends XyoArray {
  constructor(array: TestXyoObject[]) {
    super(0xFF, 0x00, 0xEE, 0xDD, 4, array);
  }
}

export class TestXyoObjectTypedArraySerializer extends XYOSerializer<TestXyoObjectTypedArray> {

  get description() {
    return {
      major: 0xEE,
      minor: 0xDD,
      sizeOfBytesToGetSize: 4
    };
  }

  public serialize(testXyoObjectTypedArray: TestXyoObjectTypedArray, xyoPacker: XyoPacker) {
    const majorMinor = xyoPacker.getMajorMinor(TestXyoObject.name);
    const packedElements = Buffer.concat(
      testXyoObjectTypedArray.array.map(element =>
      xyoPacker.serialize(element, element.id[0], element.id[1], false))
    );

    return Buffer.concat([
      Buffer.from([majorMinor.major, majorMinor.minor]),
      packedElements
    ]);
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const unpackedArray = new XyoArrayUnpacker(xyoPacker, buffer, true, 4);
    return new TestXyoObjectTypedArray(unpackedArray.array as TestXyoObject[]);
  }
}
