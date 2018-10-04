/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 3:40:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-single-type-array-byte-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:25:08 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayUnpacker } from '../xyo-array-unpacker';
import { XyoSerializer } from '../xyo-serializer';
import { XyoArray } from '../../components/arrays/xyo-array';
import { XyoPacker } from '../xyo-packer';

export class XyoArraySerializer extends XyoSerializer<XyoArray> {

  constructor (
    private readonly major: number,
    private readonly minor: number,
    private readonly size: number,
    private readonly typed: boolean
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

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const unpackedArray = new XyoArrayUnpacker(
      xyoPacker,
      buffer,
      this.typed,
      this.size
    );

    const array = unpackedArray.array;

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
