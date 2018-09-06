/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 4th September 2018 9:24:06 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 4th September 2018 10:26:30 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoResult } from '../xyo-result';
import { XyoObject } from '../xyo-object';

export abstract class XyoSigner {
  public abstract publicKey: XyoResult<XyoObject>;
  public abstract signData(data: Buffer): Promise<XyoResult<XyoObject>>;
}
