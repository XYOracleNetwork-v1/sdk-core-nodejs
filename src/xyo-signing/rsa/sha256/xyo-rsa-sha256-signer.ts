/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 2nd October 2018 5:13:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha256-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 5:18:20 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaShaSigner } from '../signer/xyo-rsa-sha-signer';
import { IXyoSignature } from '../../../@types/xyo-signing';
import { IXyoObject } from '../../../xyo-core-components/xyo-object';
import { XyoRsaSha256Signature } from './xyo-rsa-sha256-signature';

export class XyoRsaSha256Signer extends XyoRsaShaSigner {

  public static major = 0x06;
  public static minor = 0x06;

  constructor (
    public readonly getSignature: (data: Buffer) => Buffer,
    public readonly getModulus: () => Buffer,
    public readonly verifySign: (signature: IXyoSignature, data: Buffer, publicKey: IXyoObject) => Promise<boolean>,
    public readonly getPrivateKeyFn: () => any
  ) {
    super(XyoRsaSha256Signer.major, XyoRsaSha256Signer.minor);
  }

  public getReadableName(): string {
    return 'rsa-sha256-signer';
  }

  public getReadableValue() {
    return {
      publicKey: this.publicKey,
      privateKey: this.privateKey
    };
  }

  public async signData(data: Buffer): Promise<IXyoSignature> {
    const rawSignature = this.getSignature(data);
    return new XyoRsaSha256Signature(rawSignature, this.verifySign);
  }

  public getPrivateKey() {
    return this.getPrivateKeyFn();
  }
}
