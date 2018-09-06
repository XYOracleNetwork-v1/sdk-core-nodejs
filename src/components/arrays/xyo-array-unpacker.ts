/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 10:22:19 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-array-unpacker.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 5th September 2018 4:53:46 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoObject } from '../xyo-object';
import { XyoResult } from '../xyo-result';
import { XyoError } from '../xyo-error';

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
    const typeObject = XyoObjectCreator.getCreator(major, minor).value;

    if (typeObject) {
      const sizeOfBytesToRead = typeObject!.sizeOfBytesToGetSize;
      const sizeOfBytesToReadValue = sizeOfBytesToRead.value;
      if (sizeOfBytesToReadValue === null || sizeOfBytesToReadValue === undefined) {
        return null;
      }

      if ((sizeOfBytesToReadValue + this.currentPosition) > this.data.length) {
        return null;
      }

      return typeObject.readSize(
        this.data.slice(this.currentPosition, this.currentPosition + sizeOfBytesToReadValue)
      ).value!;
    }

    return null;
  }

  /**
   * A helper function to convert a Buffer into a collection.
   */
  private unpack(): XyoResult<XyoObject[]> {
    this.getSize(this.sizeOfSize);

    const items: XyoObject[] = [];
    let arrayType = new Buffer(0);

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
          return XyoResult.withError(
            new XyoError(`Can't unpack array, not enough data`,
            XyoError.errorType.ERR_CREATOR_MAPPING)
          );
        }
      }

      const sizeOfElement = this.readCurrentSize(arrayType[0], arrayType[1]);
      if (sizeOfElement !== null) {
        const field = new Buffer(sizeOfElement);

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

        items.push(XyoObjectCreator.create(merged).value!);
      } else {
        return XyoResult.withError(
          new XyoError(`Can't find size of element, ${arrayType[0]}, ${arrayType[1]}`, XyoError.errorType.ERR_CRITICAL)
        );
      }
    }

    return XyoResult.withValue(items);
  }

  /**
   * A helper function to dynamically read the size of a dynamically sized element
   */

  private getSize(sizeSize: number): number {
    const buffer = new Buffer(sizeSize);
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
