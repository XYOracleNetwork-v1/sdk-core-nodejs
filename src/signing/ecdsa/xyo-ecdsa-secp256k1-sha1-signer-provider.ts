/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 2nd October 2018 4:31:56 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ec-secp-256k-sha256-signer-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:21:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSecp256k1SignerProvider } from "./xyo-ecdsa-secp256k1-signer-provider";
import { XyoHashProvider } from "../../hash-provider/xyo-hash-provider";
import { XyoEcdsaSecp256k1Sha1Signer } from "./xyo-ecdsa-secp256k1-sha1-signer";
import { XyoEcdsaSecp256k1Signer } from "./xyo-ecdsa-secp256k1-signer";
import { XyoSignature } from "../xyo-signature";
import { XyoObject } from "../../components/xyo-object";

export class XyoEcdsaSecp256k1Sha1SignerProvider extends XyoEcdsaSecp256k1SignerProvider {

  public static major = 0x06;
  public static minor = 0x02;

  constructor(public readonly hashProvider: XyoHashProvider) {
    super(XyoEcdsaSecp256k1Sha1SignerProvider.major, XyoEcdsaSecp256k1Sha1SignerProvider.minor);
  }

  public getSigner(
    sign: (data: Buffer) => Promise<Buffer>,
    getPublicXY: () => {x: Buffer, y: Buffer},
    verifySign: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>,
    getPrivateKey: () => string
  ): XyoEcdsaSecp256k1Signer {
    return new XyoEcdsaSecp256k1Sha1Signer(sign, getPublicXY, verifySign, getPrivateKey);
  }
}
