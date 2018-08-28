/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 9:04:29 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-byte-array-setter.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 4:38:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * A helper class for Buffer building
 */
export class XyoByteArraySetter {
  private static readonly defaultValue: Buffer = new Buffer(0);
  private byteArrays: Buffer[] = [XyoByteArraySetter.defaultValue];

  /**
   * Adds a buffer to the collection that can be merged later
   *
   * @param item The buffer to add
   * @param index The index at which to add it
   */

  public add(item: Buffer, index: number) {
    this.byteArrays[index] = item;
  }

  /**
   * Merges the underlying collection of Buffer Arrays into a single Buffer
   */

  public merge(): Buffer {
    return Buffer.concat(this.byteArrays);
  }
}
