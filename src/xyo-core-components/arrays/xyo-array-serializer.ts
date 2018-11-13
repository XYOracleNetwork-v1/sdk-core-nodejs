/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 3:40:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-byte-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 3:33:10 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayUnpacker } from '../../xyo-serialization/xyo-array-unpacker';
import { XyoSerializer } from '../../xyo-serialization/xyo-serializer';
import { XyoArray } from './xyo-array';
import { XyoObject } from '../../lib';

/** A general multi-purpose serializer for `XyoArray` types */
export class XyoArraySerializer extends XyoSerializer<XyoArray> {

  constructor (
    private readonly major: number,
    private readonly minor: number,
    private readonly size: number,
    private readonly typed: boolean,
    private readonly ctor?: {
      typed?: { new(elementMajor: number, elementMinor: number, array: XyoObject[]): XyoArray },
      untyped?: { new(array: XyoObject[]): XyoArray }
    }
  ) {
    super();
  }

  get description () {
    return {
      major: this.major,
      minor: this.minor,
      sizeOfBytesToGetSize: this.size,
      sizeIdentifierSize: this.size
    };
  }

  /**
   * Get Object representation of an `XyoArray` from byte representation
   *
   * @param {Buffer} buffer
   * @returns {XyoArray}
   * @memberof XyoArraySerializer
   */

  public deserialize(buffer: Buffer): XyoArray {
    const unpackedArray = new XyoArrayUnpacker(
      buffer,
      this.typed,
      this.size
    );

    const array = unpackedArray.array;

    if (
      this.typed &&
      unpackedArray.majorType &&
      unpackedArray.minorType &&
      this.ctor &&
      this.ctor.typed
    ) {
      return new this.ctor.typed(unpackedArray.majorType, unpackedArray.minorType, array);
    }

    if (!this.typed && this.ctor && this.ctor.untyped) {
      return new this.ctor.untyped(array);
    }

    const newArray = new XyoArray(
      unpackedArray.majorType || undefined,
      unpackedArray.minorType || undefined,
      this.major,
      this.minor,
      this.size,
      array
    );

    return newArray;
  }

  /**
   * Get byte representation of an `XyoArray` from object representation
   * @param {XyoArray} xyoArray the value to serialize
   * @returns {Buffer} The byte representation of an XyoBuffer
   * @memberof XyoArraySerializer
   */

  public serialize(xyoArray: XyoArray): Buffer {
    if (!this.typed) {
      return Buffer.concat(xyoArray.array.map(element => element.serialize(true)));
    }

    const typedBuffer = Buffer.from([
      xyoArray.elementMajor,
      xyoArray.elementMinor,
    ]);

    return Buffer.concat([
      typedBuffer,
      ...xyoArray.array.map(element => element.serialize(false))
    ]);
  }
}
