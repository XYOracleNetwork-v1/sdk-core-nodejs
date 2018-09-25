/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 12:49:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-public-key-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st September 2018 12:28:49 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaPublicKey } from '../../components/signing/algorithms/rsa/xyo-rsa-public-key';
import { XYOSerializer } from '../xyo-serializer';

export class XyoRsaPublicKeySerializer extends XYOSerializer<XyoRsaPublicKey> {

  get description () {
    return {
      major: 0x04,
      minor: 0x03,
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
