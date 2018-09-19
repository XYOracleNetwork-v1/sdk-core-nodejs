/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 3:40:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-byte-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 1:48:45 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayUnpacker } from '../xyo-array-unpacker';
import { XYOSerializer } from '../xyo-serializer';
import { XyoArray } from '../../components/arrays/xyo-array';
import { XyoPacker } from '../xyo-packer';

export class XyoArraySerializer extends XYOSerializer<XyoArray> {

  constructor (
    private readonly major: number,
    private readonly minor: number,
    private readonly sizeOfBytesToGetSize: number,
    private readonly typed: boolean
  ) {
    super();
  }

  get description () {
    return {
      major: this.major,
      minor: this.minor,
      sizeOfBytesToGetSize: this.sizeOfBytesToGetSize
    };
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const unpackedArray = new XyoArrayUnpacker(
      xyoPacker,
      buffer,
      this.typed,
      this.sizeOfBytesToGetSize
    );

    const array = unpackedArray.array;

    const newArray = new XyoArray(
      unpackedArray.majorType || undefined,
      unpackedArray.minorType || undefined,
      this.major,
      this.minor,
      this.sizeOfBytesToGetSize,
      array
    );

    return newArray;
  }

  public serialize(xyoArray: XyoArray, xyoPacker: XyoPacker) {
    if (!this.typed) {
      return Buffer.concat(
        xyoArray.array.map((element) => {
          const id = element.id;
          const major = id[0];
          const minor = id[1];
          return xyoPacker.serialize(element, major, minor, true);
        })
      );
    }

    const typedBuffer = Buffer.from([
      xyoArray.elementMajor,
      xyoArray.elementMinor,
    ]);

    return Buffer.concat([
      typedBuffer,
      ...xyoArray.array.map(element =>
        xyoPacker.serialize(element, xyoArray.elementMajor!, xyoArray.elementMinor!, false)
      )
    ]);
  }
}
