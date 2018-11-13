/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 2nd October 2018 4:07:29 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-secp-256-k1-uncompressed-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 1:05:18 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaUncompressedPublicKey } from "../uncompressed-public-key/xyo-ecdsa-uncompressed-public-key";
import { writePointTo32ByteBuffer } from "../../../xyo-core-components/xyo-buffer-utils";

export class XyoEcdsaSecp256k1UnCompressedPublicKey extends XyoEcdsaUncompressedPublicKey {

  public static major = 0x04;
  public static minor = 0x01;

  constructor (private readonly xCoordinate: Buffer, private readonly yCoordinate: Buffer) {
    super(XyoEcdsaSecp256k1UnCompressedPublicKey.major, XyoEcdsaSecp256k1UnCompressedPublicKey.minor);
  }

  public getReadableName(): string {
    return 'ecdsa-secp256k1-uncompressed-public-key';
  }

  public getReadableValue() {
    return {
      x: this.x,
      y: this.y
    };
  }

  get x (): Buffer {
    return writePointTo32ByteBuffer(this.xCoordinate);
  }

  get y (): Buffer {
    return writePointTo32ByteBuffer(this.yCoordinate);
  }
}
