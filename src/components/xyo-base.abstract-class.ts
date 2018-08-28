/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 1:08:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base.abstract-class.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 3:26:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBase } from '../types/xyo-base';

export abstract class XyoBase implements IXyoBase {

  public getCanonicalName(): string {
    return this.constructor.name;
  }
}
