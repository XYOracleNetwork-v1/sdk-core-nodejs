/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:24:54 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:25:04 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSignature } from '../../signing/ecdsa/xyo-ecdsa-signature';
import { XyoSerializer } from '../xyo-serializer';
import { XyoSignature } from '../../signing/xyo-signature';
import { XyoObject } from '../../components/xyo-object';

export class XyoEcdsaSignatureSerializer extends XyoSerializer<XyoEcdsaSignature> {

  constructor(
    private readonly minor: number,
    private readonly verifySign: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>,
    private readonly ecdsaSignatureFactory: XyoEcdsaSignatureFactory
  ) {
    super();
  }

  get description () {
    return {
      major: 0x05,
      minor: this.minor,
      sizeOfBytesToGetSize: 1,
      sizeIdentifierSize: 1
    };
  }

  public deserialize(buffer: Buffer) {
    return this.ecdsaSignatureFactory.newInstance(buffer.slice(1), this.verifySign);
  }

  public serialize(ecdsaSignature: XyoEcdsaSignature) {
    return ecdsaSignature.getSignature();
  }
}

export interface XyoEcdsaSignatureFactory {
  newInstance(
    signature: Buffer,
    verify: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>
  ): XyoEcdsaSignature;
}
