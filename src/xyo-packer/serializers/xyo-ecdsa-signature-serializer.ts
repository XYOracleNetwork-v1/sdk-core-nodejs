/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:24:54 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st September 2018 12:24:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSignature } from '../../components/signing/algorithms/ecc/xyo-ecdsa-signature';
import { XYOSerializer } from '../xyo-serializer';
import { XyoSignature } from '../../components/signing/xyo-signature';
import { XyoObject } from '../../components/xyo-object';

export class XyoEcdsaSignatureSerializer extends XYOSerializer<XyoEcdsaSignature> {

  constructor(
    private readonly minor: number,
    private readonly verifySign: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>
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
    return new XyoEcdsaSignature(
      buffer.slice(1),
      Buffer.from([this.description.major, this.minor]),
      this.verifySign
    );
  }

  public serialize(ecdsaSignature: XyoEcdsaSignature) {
    return ecdsaSignature.signature;
  }
}
