/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 9:53:10 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-uncompressed-ec-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 1:01:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../xyo-object';

/**
 * Sharing public keys is an integral part of the Xyo protocol
 * This particular class is for representing an uncompressed version
 * Ec public key
 */

export class XyoUncompressedEcPublicKey extends XyoObject {

  /**
   * Creates a new instance of a XyoUncompressedEcPublicKey
   * @param x The x point on the curve in binary representation
   * @param y The y point on the curve in binary representation
   * @param rawId The rawId corresponding to particular type of EC public key this is.
   */

  constructor(public readonly x: Buffer, public readonly y: Buffer, public readonly rawId: Buffer) {
    super(rawId[0], rawId[1]);
  }

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
