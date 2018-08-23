/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 9:24:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 23rd August 2018 9:37:09 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOObject } from '../xyo-object';
import { XYOObjectCreator } from '../xyo-object-creator';

export abstract class XYOHash extends XYOObject {
  public abstract hash: Buffer;

  get data () {
    return this.hash;
  }

  public verifyHash(data: Buffer): boolean {
    const hashCreator = XYOObjectCreator.getCreator(this.id[0], this.id[1]) as XYOHashCreator;
    if (!hashCreator) {
      throw new Error(`Could not create an XYOHashCreator for Major: ${this.id[0]} and minor ${this.id[1]}`);
    }

    return hashCreator.hash(data).equals(this.hash);
  }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class XYOHashCreator extends XYOObjectCreator {
  get major () {
    return 0x04;
  }

  public abstract hash(data: Buffer): Buffer;
  public abstract createHash(data: Buffer): XYOHash;
}
