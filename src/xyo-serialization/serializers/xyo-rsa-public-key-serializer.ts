/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 12:49:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-public-key-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:08:19 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaPublicKey } from '../../xyo-signing/rsa/xyo-rsa-public-key';
import { XyoSerializer } from '../xyo-serializer';

export class XyoRsaPublicKeySerializer extends XyoSerializer<XyoRsaPublicKey> {

  get description () {
    return {
      major: XyoRsaPublicKey.major,
      minor: XyoRsaPublicKey.minor,
      sizeOfBytesToGetSize: 2,
      sizeIdentifierSize: 2
    };
  }

  public deserialize(buffer: Buffer) {
    const modulusSize = buffer.readUInt16BE(0) - 2;
    const mod = buffer.slice(2, 2 + modulusSize);
    return new XyoRsaPublicKey(mod);
  }

  public serialize(publicKey: XyoRsaPublicKey) {
    return publicKey.modulus;
  }

  public createFromPacked(buffer: Buffer) {
    const modulusSize = buffer.readUInt16BE(0) - 2;
    const mod = buffer.slice(2, 2 + modulusSize);
    return new XyoRsaPublicKey(mod);
  }
}
