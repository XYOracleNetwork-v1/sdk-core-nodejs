/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 17th September 2018 9:10:28 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-packer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 12th October 2018 9:47:53 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-classes-per-file

import { XyoPacker } from '../xyo-packer';
import {
  TestXyoObject,
  TestXyoObjectSerializer,
  TestXyoObjectTypedArraySerializer,
  TestXyoObjectTypedArray
} from '../../xyo-test-utils';
import { XyoObject } from '../../xyo-core-components/xyo-object';

describe(`XyoPacker`, () => {
  beforeAll(() => {
    XyoObject.packer = new XyoPacker();
    XyoObject.packer.registerSerializerDeserializer(TestXyoObject, new TestXyoObjectSerializer());
    XyoObject.packer.registerSerializerDeserializer(TestXyoObjectTypedArray, new TestXyoObjectTypedArraySerializer());
  });

  it(`Should serialize and deserialize objects`, () => {
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

    const typedSerialization = testValue.serialize(true);
    expect(typedSerialization.equals(typedSerialized)).toBe(true);

    const untypedSerialization = testValue.serialize(false);
    expect(untypedSerialization.equals(untypedSerialized)).toBe(true);

    const rawData = testValue.serialize(undefined);
    expect(value.equals(rawData)).toBe(true);
  });

  it(`Should serialize and deserialize arrays`, () => {
    const array = new TestXyoObjectTypedArray([new TestXyoObject('hello world')]);
    const { major, minor } = TestXyoObjectTypedArray;
    const { major: elementMajor, minor: elementMinor } = TestXyoObject;

    const rawSerialization = array.serialize(undefined);
    const typedSerialization = array.serialize(true);
    const untypedSerialization = array.serialize(false);

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
