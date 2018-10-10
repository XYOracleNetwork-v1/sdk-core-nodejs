/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 3rd October 2018 9:43:55 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-secp256k1-sha1-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:31:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSignature } from "../../xyo-ecdsa-signature";
import { IXyoSignature } from '../../../../@types/xyo-signing';
import { XyoObject } from "../../../../xyo-core-components/xyo-object";

export class XyoEcdsaSecp256k1Sha1Signature extends XyoEcdsaSignature {

  public static major = 0x05;
  public static minor = 0x02;

  constructor (
    private readonly signature: Buffer,
    private readonly verifySignFn: (signature: IXyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>
  ) {
    super(XyoEcdsaSecp256k1Sha1Signature.major, XyoEcdsaSecp256k1Sha1Signature.minor);
  }

  public getSignature(): Buffer {
    return this.signature;
  }

  public verifySign(signature: IXyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean> {
    return this.verifySignFn(signature, data, publicKey);
  }

}
