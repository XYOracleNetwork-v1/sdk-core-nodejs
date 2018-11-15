/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:24:54 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 4:57:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSignature } from './xyo-ecdsa-signature';
import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { IXyoSignature } from '../../../@types/xyo-signing';
import { IXyoObject } from '../../../xyo-core-components/xyo-object';

export class XyoEcdsaSignatureSerializer extends XyoSerializer<XyoEcdsaSignature> {

  constructor(
    private readonly minor: number,
    private readonly verifySign: (signature: IXyoSignature, data: Buffer, publicKey: IXyoObject) => Promise<boolean>,
    private readonly ecdsaSignatureFactory: IXyoEcdsaSignatureFactory
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

export interface IXyoEcdsaSignatureFactory {
  newInstance(
    signature: Buffer,
    verify: (signature: IXyoSignature, data: Buffer, publicKey: IXyoObject) => Promise<boolean>
  ): XyoEcdsaSignature;
}
