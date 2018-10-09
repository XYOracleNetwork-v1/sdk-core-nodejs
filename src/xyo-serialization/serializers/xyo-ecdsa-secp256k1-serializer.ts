/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 12:48:09 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ec-secp-256k-signer-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:08:22 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializer } from '../xyo-serializer';
import { XyoEcdsaSecp256k1Signer } from '../../xyo-signing/ecdsa/secp256k1/xyo-ecdsa-secp256k1-signer';
import { XyoEcdsaSecp256k1SignerProvider } from '../../xyo-signing/ecdsa/secp256k1/xyo-ecdsa-secp256k1-signer-provider';

export class XyoEcdsaSecp256k1SignerSerializer extends XyoSerializer<XyoEcdsaSecp256k1Signer> {

  constructor (
    private readonly minor: number,
    private readonly ecSecp256kSignerProvider: XyoEcdsaSecp256k1SignerProvider
    ) {
    super();
  }

  get description () {
    return {
      major: 0x06,
      minor: this.minor,
      sizeOfBytesToGetSize: 1,
      sizeIdentifierSize: 1
    };
  }

  public deserialize(buffer: Buffer) {
    const privateKeyBuffer = buffer.slice(1);
    const privateKeyHex = privateKeyBuffer.toString();
    return this.ecSecp256kSignerProvider.newInstance(privateKeyHex) as XyoEcdsaSecp256k1Signer;
  }

  public serialize(signer: XyoEcdsaSecp256k1Signer) {
    const privateKey = signer.privateKey;
    return Buffer.from(privateKey);
  }
}
