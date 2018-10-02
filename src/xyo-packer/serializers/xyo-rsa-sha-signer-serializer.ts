/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 10:02:00 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha-signer-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:25:20 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializer } from '../xyo-serializer';
import { XyoRsaShaSignerProvider } from '../../signing/rsa/xyo-rsa-sha-signer-provider';
import { XyoRsaShaSigner } from '../../signing/rsa/xyo-rsa-sha-signer';

/**
 * This isn't intended to be used across platforms. Its a simple insecure way of storing
 * a private key.
 */
export class XyoRsaShaSignerSerializer extends XyoSerializer<XyoRsaShaSigner> {

  constructor(
    private readonly xyoRsaSignerProvider: XyoRsaShaSignerProvider,
    private readonly minor: number,
  ) {
    super();
  }

  get description () {
    return {
      major: 0x06,
      minor: this.minor,
      sizeOfBytesToGetSize: 2,
      sizeIdentifierSize: 2
    };
  }

  public deserialize(buffer: Buffer) {
    const privateKeyBuffer = buffer.slice(2);
    const pemKey = privateKeyBuffer.toString();
    return this.xyoRsaSignerProvider.newInstance(pemKey);
  }

  public serialize(signer: XyoRsaShaSigner) {
    const privateKey = signer.privateKey;
    const stringPrivateKey = String(privateKey);
    return Buffer.from(stringPrivateKey);
  }
}
