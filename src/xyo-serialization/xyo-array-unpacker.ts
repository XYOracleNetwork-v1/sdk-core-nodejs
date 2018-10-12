/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 10:22:19 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-array-unpacker.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 4:50:30 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-core-components/xyo-object';
import { XyoError, XyoErrors } from '../xyo-core-components/xyo-error';

/**
 * Unpacks Array value in accordance with the Major/Minor protocol
 */
export class XyoArrayUnpacker {

  /** The major type of the value */
  public majorType: number | null = null;

  /** The minor type of the value */
  public minorType: number | null = null;

  /** Keeps track on the current position index when unpacking a buffer */
  private currentPosition: number;

  /**
   * Creates a new instance of an XyoArrayUnpacker
   *
   * @param data The data to unpack
   * @param typed True if the data is typed, false otherwise
   * @param sizeOfSize The size of the size element
   */

  constructor (
    private readonly data: Buffer,
    private readonly typed: boolean,
    private readonly sizeOfSize: number
  ) {
    this.currentPosition = 0;
  }

  /**
   * Returns a collection of elements
   */
  get array () {
    return this.unpack();
  }

  /**
   * Returns the byte representation of the major and minor for the underlying buffer
   */

  private getMajorMinor () {
    const major = this.data[this.currentPosition];
    this.currentPosition += 1;
    const minor = this.data[this.currentPosition];
    this.currentPosition += 1;
    return Buffer.from([major, minor]);
  }

  /**
   * returns The number of bytes the element corresponding to the major and minor element
   */

  private readCurrentSize (major: number, minor: number): number | null {
    const typeObject = XyoObject.getSerializerByMajorMinor(major, minor);

    if (typeObject) {
      const sizeOfBytesToRead = typeObject.sizeOfBytesToRead;

      if ((sizeOfBytesToRead + this.currentPosition) > this.data.length) {
        return null;
      }

      return typeObject.readSize(
        this.data.slice(this.currentPosition, this.currentPosition + sizeOfBytesToRead)
      );
    }

    return null;
  }

  /**
   * A helper function to convert a Buffer into a collection.
   */
  private unpack(): XyoObject[] {
    this.getSize(this.sizeOfSize);

    const items: XyoObject[] = [];
    let arrayType = Buffer.alloc(0);

    if (this.typed) {
      arrayType = this.getMajorMinor();
      this.majorType = arrayType[0];
      this.minorType = arrayType[1];
    }

    while (this.currentPosition < this.data.length) {
      if (!this.typed) {
        if ((this.currentPosition + 2) < this.data.length) {
          arrayType = this.getMajorMinor();
        } else {
          throw new XyoError(
            `Can't unpack array, not enough data`,
            XyoErrors.CREATOR_MAPPING
          );
        }
      }

      const sizeOfElement = this.readCurrentSize(arrayType[0], arrayType[1]);
      if (sizeOfElement !== null) {
        const field = Buffer.alloc(sizeOfElement);

        for (let i = 0; i < sizeOfElement; i += 1) {
          const byte = this.data[this.currentPosition + i];
          field[i] = byte;
        }

        this.currentPosition += sizeOfElement;

        const merged = Buffer.concat([
          Buffer.from([arrayType[0]]),
          Buffer.from([arrayType[1]]),
          field
        ]);

        items.push(XyoObject.deserialize(merged));
      } else {
        throw new XyoError(
          `Can't find size of element, ${arrayType[0]}, ${arrayType[1]}`,
          XyoErrors.CRITICAL
        );
      }
    }

    return items;
  }

  /**
   * A helper function to dynamically read the size of a dynamically sized element
   */

  private getSize(sizeSize: number): number {
    const buffer = Buffer.alloc(sizeSize);
    for (let i = 0; i < sizeSize; i += 1) {
      buffer[i] = this.data[this.currentPosition + i];
      this.currentPosition += 1;
    }

    if (this.sizeOfSize === 1) {
      return buffer.readUInt8(0);
    }

    if (this.sizeOfSize === 2) {
      return buffer.readUInt16BE(0);
    }

    if (this.sizeOfSize === 4) {
      return buffer.readUInt32BE(0);
    }

    throw new Error(`Can not handle sizes bigger than 64 bits`);
  }
}
