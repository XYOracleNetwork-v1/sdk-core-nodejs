/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 3rd October 2018 9:43:55 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-secp256k1-sha256-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 4th October 2018 11:33:53 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSignature } from "./xyo-ecdsa-signature";
import { XyoSignature } from "../xyo-signature";
import { XyoObject } from "../../components/xyo-object";

export class XyoEcdsaSecp256k1Sha256Signature extends XyoEcdsaSignature {

  public static major = 0x05;
  public static minor = 0x01;

  constructor (
    private readonly signature: Buffer,
    private readonly verifySignFn: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>
  ) {
    super(XyoEcdsaSecp256k1Sha256Signature.major, XyoEcdsaSecp256k1Sha256Signature.minor);
  }

  public getSignature(): Buffer {
    return this.signature;
  }

  public verifySign(signature: XyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean> {
    return this.verifySignFn(signature, data, publicKey);
  }

}
