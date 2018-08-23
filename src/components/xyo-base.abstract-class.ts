/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 1:08:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base.abstract-class.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 21st August 2018 3:38:10 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXYOBase } from '../types/xyo-base';

export abstract class XYOBase implements IXYOBase {

  public abstract getMajor(): number;
  public abstract getMinor(): number;

  public getCode(): number {
    return (this.getMajor() << 2) + this.getMinor(); // tslint:disable-line:no-bitwise
  }

  public getCanonicalName(): string {
    return this.constructor.name;
  }
}
