/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 9:04:29 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-byte-array-setter.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 22nd August 2018 9:24:56 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export class XYOByteArraySetter {
  private static readonly defaultValue: Buffer = new Buffer(0);
  private byteArrays: Buffer[];

  constructor(private readonly numberOfByteArrays: number) {
    this.byteArrays = [XYOByteArraySetter.defaultValue];
  }

  public add(item: Buffer, index: number) {
    this.byteArrays[index] = item;
  }

  public remove(index: number) {
    this.byteArrays[index] = XYOByteArraySetter.defaultValue;
  }

  public getByteArrays(): Buffer[] {
    return this.byteArrays;
  }

  public merge(): Buffer {
    return Buffer.concat(this.byteArrays);
  }

  public clear() {
    this.byteArrays = [XYOByteArraySetter.defaultValue];
  }
}
