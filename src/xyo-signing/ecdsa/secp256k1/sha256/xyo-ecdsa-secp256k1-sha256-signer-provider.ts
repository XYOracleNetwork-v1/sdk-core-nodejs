/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 2nd October 2018 4:31:56 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ec-secp-256k-sha256-signer-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 5:20:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSecp256k1SignerProvider } from "../signer/xyo-ecdsa-secp256k1-signer-provider";
import { IXyoHashProvider } from '../../../../@types/xyo-hashing';
import { XyoEcdsaSecp256k1Signer } from "../signer/xyo-ecdsa-secp256k1-signer";
import { XyoEcdsaSecp256k1Sha256Signer } from "./xyo-ecdsa-secp256k1-sha256-signer";
import { IXyoSignature } from '../../../../@types/xyo-signing';
import { IXyoObject } from "../../../../xyo-core-components/xyo-object";

export class XyoEcdsaSecp256k1Sha256SignerProvider extends XyoEcdsaSecp256k1SignerProvider {

  public static major = 0x06;
  public static minor = 0x01;

  constructor(public readonly hashProvider: IXyoHashProvider) {
    super(XyoEcdsaSecp256k1Sha256SignerProvider.major, XyoEcdsaSecp256k1Sha256SignerProvider.minor);
  }

  public getReadableName(): string {
    return 'ecdsa-secp256k1-sha256-signer-provider';
  }

  public getReadableValue() {
    return null;
  }

  public getSigner(
    sign: (data: Buffer) => Promise<Buffer>,
    getPublicXY: () => {x: Buffer, y: Buffer},
    verifySign: (signature: IXyoSignature, data: Buffer, publicKey: IXyoObject) => Promise<boolean>,
    getPrivateKey: () => string
  ): XyoEcdsaSecp256k1Signer {
    return new XyoEcdsaSecp256k1Sha256Signer(sign, getPublicXY, verifySign, getPrivateKey);
  }
}
