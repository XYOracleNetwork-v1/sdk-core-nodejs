/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:07:21 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha1-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 5:20:48 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaSignature } from '../signature/xyo-rsa-signature';
import { IXyoSignature } from '../../../@types/xyo-signing';
import { IXyoObject } from '../../../xyo-core-components/xyo-object';

/**
 * Wraps an RSA-Sha1 Signature with some verification functionality
 *
 * @major 0x05
 * @minor 0x09
 */

export class XyoRsaSha1Signature extends XyoRsaSignature {

  public static major = 0x05;
  public static minor = 0x09;

  /**
   * Creates a new instance of a XyoRSASha1Signature
   *
   * @param signature The raw RSASha1 signature
   * @param verifySign A signature verifier
   */

  constructor(
    public readonly rawSignature: Buffer,
    public readonly verifyFn: (signature: IXyoSignature, data: Buffer, publicKey: IXyoObject) => Promise<boolean>
  ) {
    super(XyoRsaSha1Signature.major, XyoRsaSha1Signature.minor);
  }

  public getReadableName(): string {
    return 'rsa-sha1-signature';
  }

  public getReadableValue() {
    return this.rawSignature;
  }

  public verifySign(signature: IXyoSignature, data: Buffer, publicKey: IXyoObject): Promise<boolean> {
    return this.verifyFn(signature, data, publicKey);
  }
}
