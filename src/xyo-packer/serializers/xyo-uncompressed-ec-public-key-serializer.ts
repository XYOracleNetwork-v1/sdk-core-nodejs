/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 10:27:42 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-uncompressed-ec-public-key-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 4:56:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOSerializer } from '../xyo-serializer';
import { XyoUncompressedEcPublicKey } from '../../components/signing/algorithms/ecc/xyo-uncompressed-ec-public-key';

export class XyoUncompressedEcPublicKeySerializer extends XYOSerializer<XyoUncompressedEcPublicKey> {

  constructor(private readonly minor: number) {
    super();
  }

  get description () {
    return {
      major: 0x02,
      minor: this.minor,
      staticSize: 64
    };
  }

  public deserialize(buffer: Buffer) {
    return new XyoUncompressedEcPublicKey(
      buffer.slice(0, 32),
      buffer.slice(32, 64),
      Buffer.from([this.description.major, this.description.minor])
    );
  }

  public serialize(publicKey: XyoUncompressedEcPublicKey) {
    return Buffer.concat([
      publicKey.get32ByteEcPoint(publicKey.x),
      publicKey.get32ByteEcPoint(publicKey.y)
    ]);
  }
}
