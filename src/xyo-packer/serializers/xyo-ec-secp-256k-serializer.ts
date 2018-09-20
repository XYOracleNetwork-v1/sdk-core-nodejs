/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th September 2018 12:48:09 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ec-secp-256k-signer-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 20th September 2018 1:59:33 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOSerializer } from '../xyo-serializer';
import { XyoEcSecp256k } from '../../components/signing/algorithms/ecc/xyo-ec-secp-256k';
import { XyoEcSecp256kSignerProvider } from '../../signing/xyo-ec-secp-256k-signer-provider';

export class XyoEcSecp256kSignerSerializer extends XYOSerializer<XyoEcSecp256k> {

  constructor (
    private readonly minor: number,
    private readonly ecSecp256kSignerProvider: XyoEcSecp256kSignerProvider
    ) {
    super();
  }

  get description () {
    return {
      major: 0x06,
      minor: this.minor,
      sizeOfBytesToGetSize: 1
    };
  }

  public deserialize(buffer: Buffer) {
    const privateKeyBuffer = buffer.slice(1);
    const privateKeyHex = privateKeyBuffer.toString();
    return this.ecSecp256kSignerProvider.newInstance(privateKeyHex) as XyoEcSecp256k;
  }

  public serialize(signer: XyoEcSecp256k) {
    const privateKey = signer.privateKey;
    return Buffer.from(privateKey);
  }
}
