/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:07:21 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha256-signature.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:37:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaSignature } from './xyo-rsa-signature';
import { XyoSignature } from '../xyo-signature';
import { XyoObject } from '../../components/xyo-object';

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
    public readonly verifyFn: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>
  ) {
    super(XyoRsaSha256Signature.major, XyoRsaSha256Signature.minor);
  }

  public verifySign(signature: XyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean> {
    return this.verifyFn(signature, data, publicKey);
  }
}
