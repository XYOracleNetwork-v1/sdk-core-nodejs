/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 2nd October 2018 4:07:29 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-secp-256-k1-uncompressed-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:17:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaUncompressedPublicKey } from "../xyo-ecdsa-uncompressed-public-key";

export class XyoEcdsaSecp256k1UnCompressedPublicKey extends XyoEcdsaUncompressedPublicKey {

  public static major = 0x04;
  public static minor = 0x01;

  constructor (public readonly x: Buffer, public readonly y: Buffer) {
    super(XyoEcdsaSecp256k1UnCompressedPublicKey.major, XyoEcdsaSecp256k1UnCompressedPublicKey.minor);
  }
}
