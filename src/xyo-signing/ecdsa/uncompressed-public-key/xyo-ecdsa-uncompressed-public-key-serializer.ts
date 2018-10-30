/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 10:27:42 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-uncompressed-ec-public-key-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 30th October 2018 12:50:37 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoEcdsaUncompressedPublicKey } from './xyo-ecdsa-uncompressed-public-key';
import { writePointTo32ByteBuffer } from '../../../xyo-core-components/xyo-buffer-utils';

export class XyoEcdsaUncompressedPublicKeySerializer extends XyoSerializer<XyoEcdsaUncompressedPublicKey> {

  constructor(
    private readonly minor: number,
    private readonly ecdsaUncompressedPublicKeyFactory: IXyoEcdsaUncompressedPublicKeyFactory
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
      (writePointTo32ByteBuffer(publicKey.x)),
      (writePointTo32ByteBuffer(publicKey.y))
    ]);
  }
}

export interface IXyoEcdsaUncompressedPublicKeyFactory {
  newInstance: (x: Buffer, y: Buffer) => XyoEcdsaUncompressedPublicKey;
}
