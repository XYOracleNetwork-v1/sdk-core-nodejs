/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 10:02:00 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha-signer-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:08:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoRsaShaSignerProvider } from './xyo-rsa-sha-signer-provider';
import { XyoRsaShaSigner } from './xyo-rsa-sha-signer';

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
