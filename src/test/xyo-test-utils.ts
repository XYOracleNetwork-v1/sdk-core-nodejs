/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 17th September 2018 10:30:46 am
 * @Email:  developer@xyfindables.com
 * @Filename: test-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 10:59:17 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-classes-per-file

import { XyoObject } from '../xyo-core-components/xyo-object';
import { XyoSerializer } from '../xyo-serialization/xyo-serializer';
import { XyoPacker } from '../xyo-serialization/xyo-packer';
import { XyoArray } from '../xyo-core-components/arrays/xyo-array';
import { XyoArrayUnpacker } from '../xyo-serialization/xyo-array-unpacker';

export class TestXyoObject extends XyoObject {

  public static major = 0xFF;
  public static minor = 0x00;

  constructor (public readonly value: string) {
    super(TestXyoObject.major, TestXyoObject.minor);
  }
}

export class TestXyoObjectSerializer extends XyoSerializer<TestXyoObject> {

  get description() {
    return {
      major: TestXyoObject.major,
      minor: TestXyoObject.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 4
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

  public static major = 0xEE;
  public static minor = 0xDD;

  constructor(array: TestXyoObject[]) {
    super(
      TestXyoObject.major,
      TestXyoObject.minor,
      TestXyoObjectTypedArray.major,
      TestXyoObjectTypedArray.minor,
      4,
      array
    );
  }
}

export class TestXyoObjectTypedArraySerializer extends XyoSerializer<TestXyoObjectTypedArray> {

  get description() {
    return {
      major: TestXyoObjectTypedArray.major,
      minor: TestXyoObjectTypedArray.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 4
    };
  }

  public serialize(testXyoObjectTypedArray: TestXyoObjectTypedArray, xyoPacker: XyoPacker) {
    const packedElements = Buffer.concat(
      testXyoObjectTypedArray.array.map(element =>
      xyoPacker.serialize(element, false))
    );

    return Buffer.concat([
      Buffer.from([TestXyoObject.major, TestXyoObject.minor]),
      packedElements
    ]);
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const unpackedArray = new XyoArrayUnpacker(xyoPacker, buffer, true, 4);
    return new TestXyoObjectTypedArray(unpackedArray.array as TestXyoObject[]);
  }
}
