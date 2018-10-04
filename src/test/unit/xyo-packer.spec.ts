/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 17th September 2018 9:10:28 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-packer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:11:33 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-classes-per-file

import { XyoPacker } from '../../xyo-packer/xyo-packer';
import {
  TestXyoObject,
  TestXyoObjectSerializer,
  TestXyoObjectTypedArraySerializer,
  TestXyoObjectTypedArray
} from '../xyo-test-utils';

let packer: XyoPacker | undefined;
describe(`XyoPacker`, () => {
  beforeAll(() => {
    packer = new XyoPacker();
    packer.registerSerializerDeserializer(TestXyoObject, new TestXyoObjectSerializer());
    packer.registerSerializerDeserializer(TestXyoObjectTypedArray, new TestXyoObjectTypedArraySerializer());
  });

  it(`Should serialize and deserialize objects`, () => {
    if (!packer) {
      throw new Error(`Tests not initialized`);
    }

    const { major, minor } = TestXyoObject;
    const rawValue = 'hello world';
    const value = Buffer.from(rawValue);
    const size = value.length + 4;
    const sizeBuffer = Buffer.alloc(4);
    sizeBuffer.writeUInt32BE(size, 0);

    const typedSerialized = Buffer.concat([
      Buffer.from([major, minor]),
      sizeBuffer,
      value
    ]);

    const untypedSerialized = Buffer.concat([
      sizeBuffer,
      value
    ]);

    const testValue = new TestXyoObject(rawValue);

    const typedSerialization = packer.serialize(testValue, major, minor, true);
    expect(typedSerialization.equals(typedSerialized)).toBe(true);

    const untypedSerialization = packer.serialize(testValue, major, minor, false);
    expect(untypedSerialization.equals(untypedSerialized)).toBe(true);

    const rawData = packer.serialize(testValue, major, minor, undefined);
    expect(value.equals(rawData)).toBe(true);
  });

  it(`Should serialize and deserialize arrays`, () => {
    if (!packer) {
      throw new Error(`Tests not initialized`);
    }

    const array = new TestXyoObjectTypedArray([new TestXyoObject('hello world')]);
    const { major, minor } = TestXyoObjectTypedArray;
    const { major: elementMajor, minor: elementMinor } = TestXyoObject;

    const rawSerialization = packer.serialize(array, major, minor, undefined);
    const typedSerialization = packer.serialize(array, major, minor, true);
    const untypedSerialization = packer.serialize(array, major, minor, false);

    expect(rawSerialization[0]).toBe(elementMajor);
    expect(rawSerialization[1]).toBe(elementMinor);

    const sizeOfArrayValue = rawSerialization.readUInt32BE(2);
    expect(rawSerialization.length - 2).toBe(sizeOfArrayValue);

    expect(untypedSerialization.length).toBe(rawSerialization.length + 4);
    expect(untypedSerialization.readUInt32BE(0)).toBe(untypedSerialization.length);
    expect(untypedSerialization.slice(4).equals(rawSerialization));

    expect(typedSerialization.length).toBe(untypedSerialization.length + 2);
    expect(typedSerialization[0]).toBe(major);
    expect(typedSerialization[1]).toBe(minor);
    expect(typedSerialization.slice(2).equals(untypedSerialization));
  });
});
