/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 9:53:10 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-uncompressed-ec-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:12:07 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../xyo-core-components/xyo-object';
import { IXyoPublicKey } from '../../@types/xyo-signing';

/**
 * Sharing public keys is an integral part of the Xyo protocol
 * This particular class is for representing an uncompressed version
 * Ec public key
 */

export abstract class XyoEcdsaUncompressedPublicKey extends XyoObject implements IXyoPublicKey {
  public abstract x: Buffer;
  public abstract y: Buffer;

  public getRawPublicKey() {
    return Buffer.from([
      this.x,
      this.y
    ]);
  }
}
