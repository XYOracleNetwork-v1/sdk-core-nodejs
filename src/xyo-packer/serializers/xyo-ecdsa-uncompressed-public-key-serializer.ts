/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 10:27:42 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-uncompressed-ec-public-key-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:25:03 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializer } from '../xyo-serializer';
import { XyoEcdsaUncompressedPublicKey } from '../../signing/ecdsa/xyo-ecdsa-uncompressed-public-key';

export class XyoEcdsaUncompressedPublicKeySerializer extends XyoSerializer<XyoEcdsaUncompressedPublicKey> {

  constructor(
    private readonly minor: number,
    private readonly ecdsaUncompressedPublicKeyFactory: XyoEcdsaUncompressedPublicKeyFactory
  ) {
    super();
  }

  get description () {
    return {
      major: 0x04,
      minor: this.minor,
      staticSize: 64,
      sizeIdentifierSize: 0
    };
  }

  public deserialize(buffer: Buffer) {
    return this.ecdsaUncompressedPublicKeyFactory.newInstance(
      buffer.slice(0, 32),
      buffer.slice(32, 64)
    );
  }

  public serialize(publicKey: XyoEcdsaUncompressedPublicKey) {
    return Buffer.concat([
      publicKey.get32ByteEcPoint(publicKey.x),
      publicKey.get32ByteEcPoint(publicKey.y)
    ]);
  }
}

export interface XyoEcdsaUncompressedPublicKeyFactory {
  newInstance: (x: Buffer, y: Buffer) => XyoEcdsaUncompressedPublicKey;
}
