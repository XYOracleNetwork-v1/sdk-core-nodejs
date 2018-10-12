/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 2:19:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 5:29:03 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializer } from './xyo-serializer';
import { XyoObject } from '../xyo-core-components/xyo-object';
import { XyoError, XyoErrors } from '../xyo-core-components/xyo-error';
import { XyoBase } from '../xyo-core-components/xyo-base';
import { IXyoObjectDescriptor } from '../@types/xyo-serialization';

/**
 * An XyoPacker is a central serializer/deserializer registry service.
 * This will allow classes to not worry about how they themselves are
 * represented in the xyo-packing protocol
 */
export class XyoPacker extends XyoBase {

  // tslint:disable-next-line:prefer-array-literal The collections serializer/deserializers
  private readonly serializerDeserializersCollection: Array<XyoSerializer<any>> = [];

  // An index from [major][minor] to the index of the array in which the serializer/deserializer is located
  private readonly serializerDeserializerMajorMinorIndex: {[s: string]: {[s: string]: number } } = {};

  /**
   * Adds a serializer/deserializer. Serializer/Deserializers should conform to
   * the XYO spec of packing and unpacking objects
   *
   * @param name The name of class
   * @param serializerDeserializer An instance of a `XYOPackerSerializerDeserializer`
   */

  public registerSerializerDeserializer<T extends XyoObject>(
    descriptor: IXyoObjectDescriptor,
    serializerDeserializer: XyoSerializer<T>
  ) {
    /** Add to collection */
    this.serializerDeserializersCollection.push(serializerDeserializer);

    /** Add to the indexes */
    const index = this.serializerDeserializersCollection.length - 1;
    const { major, minor } = serializerDeserializer.description;
    this.serializerDeserializerMajorMinorIndex[major] = this.serializerDeserializerMajorMinorIndex[major] || {};
    this.serializerDeserializerMajorMinorIndex[major][minor] = index;
  }

  /**
   * Attempts to serialize an object to a buffer that meets the xyo-packing specification protocol
   *
   * @param object The object to serialize
   * @param major The major value of the object
   * @param minor The minor value of the object
   * @param typed true if typed, false if untyped, undefined for raw
   * @returns The Buffer representation of the xyo-object.
   *
   * @throws Will throw an `XyoError` of type `ERR_CREATOR_MAPPING` if a serializer can not be located
   */

  public serialize(object: XyoObject, typed?: boolean): Buffer {
    if (this.serializerDeserializerMajorMinorIndex[object.major]) { // See if a major record exist

      // Check to see if a minor record exists. Assert typeof number since `0` is a valid value
      if (typeof this.serializerDeserializerMajorMinorIndex[object.major][object.minor] === 'number') {

        // Get index and assert the index is in range of the underlying data collection
        const index = this.serializerDeserializerMajorMinorIndex[object.major][object.minor];
        if (index < this.serializerDeserializersCollection.length) {
          // Attempt to serialize
          const serializer = this.serializerDeserializersCollection[index];
          const serialized = serializer.serialize(object);
          if (typed === undefined) {
            return serialized;
          }

          if (typed) {
            const typedResult = this.makeTyped(serialized, serializer);
            return typedResult;
          }

          const untypedResult = this.makeUntyped(serialized, serializer);
          return untypedResult;
        }
      }
    }

    throw new XyoError(
      `Could not find serializer for major ${object.major} and minor ${object.minor}`,
      XyoErrors.CREATOR_MAPPING
    );
  }

  public deserialize<T extends XyoObject>(buffer: Buffer): T {
    if (!buffer || buffer.length < 2) {
      throw new XyoError(`Unable to deserialize buffer`, XyoErrors.CREATOR_MAPPING);
    }

    const major = buffer[0];
    const minor = buffer[1];
    if (this.serializerDeserializerMajorMinorIndex[major]) { // See if a major record exist

      // Check to see if a minor record exists. Assert typeof number since `0` is a valid value
      if (typeof this.serializerDeserializerMajorMinorIndex[major][minor] === 'number') {

        // Get index and assert the index is in range of the underlying data collection
        const index = this.serializerDeserializerMajorMinorIndex[major][minor];
        if (index < this.serializerDeserializersCollection.length) {
          const srcBuffer = buffer.slice(2);
          // Attempt to serialize
          try {
            const serializer = this.serializerDeserializersCollection[index];
            return serializer.deserialize(srcBuffer);
          } catch (err) {
            const errorMessage = `An error occurred deserializing an object with major ${major}, minor ${minor}.
            \n\nHexBuffer: ${srcBuffer.toString('hex')}`;
            this.logError(errorMessage);
            throw err;
          }
        }
      }
    }

    throw new XyoError(`Could not find serializer for major ${major} and minor ${minor}`, XyoErrors.CREATOR_MAPPING);
  }

  public getSerializerByMajorMinor<T extends XyoObject>(major: number, minor: number): XyoSerializer<T> | undefined {
    const index = this.serializerDeserializerMajorMinorIndex[major][minor];
    if (index < this.serializerDeserializersCollection.length) {
      return this.serializerDeserializersCollection[index];
    }

    return undefined;
  }

  public getSerializerByDescriptor(descriptor: IXyoObjectDescriptor) {
    const majorIndex = this.serializerDeserializerMajorMinorIndex[descriptor.major] || {};
    const serializerIndex = majorIndex[descriptor.minor];
    if (serializerIndex === undefined || serializerIndex >= this.serializerDeserializersCollection.length) {
      throw new XyoError(
        `Unable to locate serializer [${descriptor.major}][${descriptor.major}]`,
        XyoErrors.CREATOR_MAPPING
      );
    }

    return this.serializerDeserializersCollection[serializerIndex];
  }

  private makeTyped(data: Buffer, config: XyoSerializer<XyoObject>) {
    const encodedSizeBuffer = this.encodedSize(data.length, config);
    const dataBuffer = data || Buffer.alloc(0);

    const typedBufferSize = config.id.length + encodedSizeBuffer.length + dataBuffer.length;

    const typedBuffer = Buffer.concat([
      config.id,
      encodedSizeBuffer,
      dataBuffer
    ], typedBufferSize);

    return typedBuffer;
  }

  private makeUntyped(data: Buffer, config: XyoSerializer<XyoObject>) {
    const encodedSizeBuffer = this.encodedSize(data.length, config);
    const dataBuffer = data || Buffer.alloc(0);
    const typedBufferSize = encodedSizeBuffer.length + dataBuffer.length;

    const unTypedBuffer = Buffer.concat([
      encodedSizeBuffer,
      dataBuffer
    ], typedBufferSize);

    return unTypedBuffer;
  }

  private encodedSize(sizeOfData: number, config: XyoSerializer<XyoObject>) {
    if (!config.sizeIdentifierSize) {
      return Buffer.alloc(0);
    }

    const buffer = Buffer.alloc(config.sizeIdentifierSize || 0);

    switch (config.sizeIdentifierSize) {
      case 1:
        buffer.writeUInt8(sizeOfData + (config.sizeIdentifierSize || 0), 0);
        break;
      case 2:
        buffer.writeUInt16BE(sizeOfData + (config.sizeIdentifierSize || 0), 0);
        break;
      case 4:
        buffer.writeUInt32BE(sizeOfData + (config.sizeIdentifierSize || 0), 0);
        break;
    }

    return buffer;
  }
}
