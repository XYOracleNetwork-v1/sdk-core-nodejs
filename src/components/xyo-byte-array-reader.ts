/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 12:35:15 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-byte-array-reader.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:53:39 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export class XyoByteArrayReader {
  constructor(private readonly bytes: Buffer) {}

  public read(offset: number, size: number): Buffer {
    const target = new Buffer(size);

    for (let i = 0; i < size; i += 1) {
      target[i] = this.bytes[offset + i];
    }

    return target;
  }
}
