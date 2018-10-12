/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:07:21 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha256-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:29:30 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaSignature } from '../signature/xyo-rsa-signature';
import { IXyoSignature } from '../../../@types/xyo-signing';
import { XyoObject } from '../../../xyo-core-components/xyo-object';

/**
 * Wraps an RSA-Sha256 Signature with some verification functionality
 *
 * @major 0x05
 * @minor 0x08
 */

export class XyoRsaSha256Signature extends XyoRsaSignature {

  public static major = 0x05;
  public static minor = 0x08;

  /**
   * Creates a new instance of a XyoRSASha256Signature
   *
   * @param signature The raw RSASha256 signature
   * @param verifySign A signature verifier
   */

  constructor(
    public readonly rawSignature: Buffer,
    public readonly verifyFn: (signature: IXyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>
  ) {
    super(XyoRsaSha256Signature.major, XyoRsaSha256Signature.minor);
  }

  public verifySign(signature: IXyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean> {
    return this.verifyFn(signature, data, publicKey);
  }
}
