/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 1:49:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-type.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 3:24:20 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { XyoResult } from './xyo-result';
export abstract class XyoType {
  public abstract major: number; // 1 Byte max
  public abstract minor: number; // 1 Byte max

  get id() {
    return XyoResult.withValue(Buffer.from([this.major, this.minor]));
  }
}
