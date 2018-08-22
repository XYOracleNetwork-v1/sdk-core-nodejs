/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 10:22:19 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-array-unpacker.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 22nd August 2018 11:15:26 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOObjectCreator } from '../xyo-object-creator';
import { XYOObject } from '../xyo-object';
import { XYOByteArraySetter } from '../xyo-byte-array-setter';

export class XYOArrayUnpacker {
  public majorType: number | null = null;
  public minorType: number | null = null;

  private currentPosition: number;

  constructor (
    private readonly data: Buffer,
    private readonly typed: boolean,
    private readonly sizeOfSize: number,
    private readonly sizeOfElementSize: number
  ) {
    this.currentPosition = 2;
  }

  get array () {
    return this.unpack();
  }

  private getMajorMinor () {
    const major = this.data[this.currentPosition];
    const minor = this.data[this.currentPosition + 1];
    this.currentPosition += 2;
    return Buffer.from([major, minor]);
  }

  private readCurrentSize (major: number, minor: number): number | null {
    const creator = XYOObjectCreator.getCreator(major, minor);
    if (!creator) {
      return null;
    }

    const sizeOfSizeElement = creator.sizeOfSize;
    if (sizeOfSizeElement === null) {
      return creator.defaultSize;
    }

    return this.getSize(this.sizeOfElementSize);
  }

  private unpack() {
    const items: XYOObject[] = [];
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
        const merger = new XYOByteArraySetter(3);
        merger.add(Buffer.from([arrayType[0]]), 0);
        merger.add(Buffer.from([arrayType[1]]), 1);
        merger.add(field, 2);

        items.push(XYOObjectCreator.create(merger.merge())!);
      }
    }

    return items;
  }

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
