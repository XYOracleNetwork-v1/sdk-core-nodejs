/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 9:04:29 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-byte-array-setter.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:49:08 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export class XyoByteArraySetter {
  private static readonly defaultValue: Buffer = new Buffer(0);
  private byteArrays: Buffer[];

  constructor(private readonly numberOfByteArrays: number) {
    this.byteArrays = [XyoByteArraySetter.defaultValue];
  }

  public add(item: Buffer, index: number) {
    this.byteArrays[index] = item;
  }

  public remove(index: number) {
    this.byteArrays[index] = XyoByteArraySetter.defaultValue;
  }

  public getByteArrays(): Buffer[] {
    return this.byteArrays;
  }

  public merge(): Buffer {
    return Buffer.concat(this.byteArrays);
  }

  public clear() {
    this.byteArrays = [XyoByteArraySetter.defaultValue];
  }
}
