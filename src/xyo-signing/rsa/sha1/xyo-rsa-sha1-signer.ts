/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 2nd October 2018 5:13:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha1-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 12th October 2018 10:10:21 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaShaSigner } from '../signer/xyo-rsa-sha-signer';
import { IXyoSignature } from '../../../@types/xyo-signing';
import { XyoObject } from '../../../xyo-core-components/xyo-object';
import { XyoRsaSha1Signature } from './xyo-rsa-sha1-signature';

export class XyoRsaSha1Signer extends XyoRsaShaSigner {

  public static major = 0x06;
  public static minor = 0x07;

  constructor (
    public readonly getSignature: (data: Buffer) => Buffer,
    public readonly getModulus: () => Buffer,
    public readonly verifySign: (signature: IXyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>,
    public readonly getPrivateKeyFn: () => any
  ) {
    super(XyoRsaSha1Signer.major, XyoRsaSha1Signer.minor);
  }

  public async signData(data: Buffer): Promise<IXyoSignature> {
    const rawSignature = this.getSignature(data);
    return new XyoRsaSha1Signature(rawSignature, this.verifySign);
  }

  public getPrivateKey() {
    return this.getPrivateKeyFn();
  }
}
