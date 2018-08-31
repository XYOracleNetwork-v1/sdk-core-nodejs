/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 3:46:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signing-object.ts
 * @Last modified by:
 * @Last modified time:
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoResult } from '../xyo-result';
import { XyoObject } from '../xyo-object';

export abstract class XyoSigningCreator {
  public abstract key: number;

  public abstract newInstance(): XyoResult<XyoSigningObject>;

  public abstract verifySign(
    signature: XyoObject,
    byteArray: Buffer,
    publicKey: XyoObject
  ): Promise<XyoResult<boolean>>;

  public enable() {
    XyoSigningObject.signingCreators[this.key] = this;
  }

  public disable() {
    delete XyoSigningObject.signingCreators[this.key];
  }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class XyoSigningObject {

  public static signingCreators: {[s: string]: XyoSigningCreator} = {};

  public static getCreator(byte: number) {
    return XyoSigningObject.signingCreators[String(byte)];
  }

  public abstract publicKey: XyoResult<XyoObject>;

  public abstract signData(buffer: Buffer): Promise<XyoResult<XyoObject>>;
}
