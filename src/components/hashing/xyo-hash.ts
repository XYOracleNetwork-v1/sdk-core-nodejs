/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 9:24:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 9:18:53 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoResult } from '../xyo-result';

export abstract class XyoHash extends XyoObject {
  public abstract hash: Buffer;

  get data () {
    return this.hash;
  }

  public verifyHash(data: Buffer): boolean {
    const hashCreator = XyoObjectCreator.getCreator(this.id[0], this.id[1]) as XyoHashCreator;
    if (!hashCreator) {
      throw new Error(`Could not create an XyoHashCreator for Major: ${this.id[0]} and minor ${this.id[1]}`);
    }

    return hashCreator.hash(data).equals(this.hash);
  }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class XyoHashCreator extends XyoObjectCreator {
  get major () {
    return 0x04;
  }

  public abstract hash(data: Buffer): Buffer;
  public abstract createHash(data: Buffer): Promise<XyoResult<XyoHash>>;
}
