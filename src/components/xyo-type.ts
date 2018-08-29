/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 1:49:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-type.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 4:29:13 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { XyoResult } from './xyo-result';
export abstract class XyoType {
  public abstract major: number; // 1 Byte max
  public abstract minor: number; // 1 Byte max

  get id() {
    const buffer = new Buffer(2);
    buffer.writeUInt8(this.major, 0);
    buffer.writeUInt8(this.minor, 1);
    return XyoResult.withValue(buffer);
  }
}
