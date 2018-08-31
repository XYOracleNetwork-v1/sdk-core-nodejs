/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 10:22:19 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-array-unpacker.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 1:55:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoObject } from '../xyo-object';
import { XyoByteArraySetter } from '../xyo-byte-array-setter';
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
    this.currentPosition = 2; // set to 2 to account for offset of major and minor bytes
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
    const minor = this.data[this.currentPosition + 1];
    this.currentPosition += 2;
    return Buffer.from([major, minor]);
  }

  /**
   * returns The number of bytes the element corresponding to the major and minor element
   */

  private readCurrentSize (major: number, minor: number): number | null {
    const creator = XyoObjectCreator.getCreator(major, minor);
    if (creator.hasError()) {
      throw new Error(`Could not find Creator ${major} ${minor}`);
    }

    const sizeOfSizeElement = creator.value!.sizeOfBytesToGetSize;
    if (sizeOfSizeElement === null) {
      return creator.value!.readSize(new Buffer(0)).value!;
    }
    // TODO
    return null;
  }

  /**
   * A helper function to convert a Buffer into a collection.
   */
  private unpack() {
    const items: XyoObject[] = [];
    let arrayType = new Buffer(0);

    if (this.typed) {
      arrayType = this.getMajorMinor();
      this.majorType = arrayType[0];
      this.minorType = arrayType[1];
    }

    while (this.currentPosition < this.data.length) {
      if (!this.typed) {
        arrayType = this.getMajorMinor();
      }

      const sizeOfElement = this.readCurrentSize(arrayType[0], arrayType[1]);
      if (sizeOfElement != null) {
        const field = new Buffer(sizeOfElement);

        for (let i = 0; i < sizeOfElement - 1; i += 1) {
          const byte = this.data[this.currentPosition + i];
          field[i] = byte;
        }

        this.currentPosition += sizeOfElement;
        const merger = new XyoByteArraySetter();
        merger.add(Buffer.from([arrayType[0]]), 0);
        merger.add(Buffer.from([arrayType[1]]), 1);
        merger.add(field, 2);

        items.push(XyoObjectCreator.create(merger.merge()).value!);
      }
    }

    return items;
  }

  /**
   * A helper function to dynamically read the size of a dynamically sized element
   */

  private getSize(sizeSize: number): number {
    const buffer = new Buffer(sizeSize);
    for (let i = 0; i < sizeSize - 1; i += 1) {
      buffer[i] = this.data[this.currentPosition + i];
      this.currentPosition += 1;
    }

    if (this.sizeOfSize === 2) {
      return buffer.readUInt16BE(0);
    }

    if (this.sizeOfSize === 4) {
      return buffer.readUInt32BE(0);
    }

    if (this.sizeOfSize === 8) {
      return parseInt(buffer.toString('hex'), 16);
    }

    throw new Error(`Can not handle sizes bigger than 64 bits`);
  }
}
