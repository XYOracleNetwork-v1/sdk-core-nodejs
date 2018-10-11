/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 2:54:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-packer-serializer-deserializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 5:24:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-core-components/xyo-object';
import { XyoError, XyoErrors } from '../xyo-core-components/xyo-error';
import { XyoBase } from '../xyo-core-components/xyo-base';
import { IXyoSerializationDescription } from '../@types/xyo-serialization';

/**
 * An interface for going between serialized and deserialized versions
 * of any XyoObject
 */

export abstract class XyoSerializer<T extends XyoObject> extends XyoBase {

  /**
   * The attributes necessary to be able to properly serialize/deserialize
   * according to xyo-packing protocol
   */

  public abstract description: IXyoSerializationDescription;

  /**
   * Should return a Buffer representation of the
   * the XyoObject in accordance with the xyo-packing protocol
   */
  public abstract serialize(xyoObject: T): Buffer;

  /**
   * This method should return an instance of a class that implements
   * XyoObject.
   */
  public abstract deserialize(buffer: Buffer): T;

  get sizeOfBytesToRead (): number {

    if (this.description.staticSize !== undefined) {
      return 0;
    }

    if (this.description.sizeOfBytesToGetSize !== undefined) {
      const size = this.description.sizeOfBytesToGetSize;
      if (size !== undefined && [1, 2, 4].indexOf(size) > -1) {
        return size;
      }
    }

    throw new XyoError(`XyoSerialization misconfiguration error`, XyoErrors.CREATOR_MAPPING);
  }

  get sizeIdentifierSize () {
    return this.description.sizeIdentifierSize;
  }

  get id () {
    return Buffer.from([
      this.description.major,
      this.description.minor
    ]);
  }

  /**
   * Consider over-writing in subclasses
   */
  public readSize(buffer: Buffer) {
    if (this.description.staticSize !== undefined) {
      return this.description.staticSize;
    }

    if (this.sizeOfBytesToRead === 1) {
      return buffer.readUInt8(0);
    }

    if (this.sizeOfBytesToRead === 2) {
      return buffer.readUInt16BE(0);
    }

    if (this.sizeOfBytesToRead === 4) {
      return buffer.readUInt32BE(0);
    }

    throw new XyoError(`XyoSerialization misconfiguration error`, XyoErrors.CREATOR_MAPPING);
  }
}
