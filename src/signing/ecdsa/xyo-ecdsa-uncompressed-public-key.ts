/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 9:53:10 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-uncompressed-ec-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 1:10:12 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../components/xyo-object';

/**
 * Sharing public keys is an integral part of the Xyo protocol
 * This particular class is for representing an uncompressed version
 * Ec public key
 */

export abstract class XyoEcdsaUncompressedPublicKey extends XyoObject {

  public abstract x: Buffer;
  public abstract y: Buffer;

  public get32ByteEcPoint(point: Buffer) {
    if (point.length === 32) {
      return point;
    }

    return point.slice(1, 33);
  }

  /**
   * Returns the binary encoded public key
   */

  public getEncoded() {
    return Buffer.concat([
      this.get32ByteEcPoint(this.x),
      this.get32ByteEcPoint(this.y)
    ]);
  }
}
