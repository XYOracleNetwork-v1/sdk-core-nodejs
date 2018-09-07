/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:24:54 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 4:56:46 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaSignature } from '../../components/signing/algorithms/ecc/xyo-ecdsa-signature';
import { XYOSerializer } from '../xyo-serializer';

export class XyoEcdsaSignatureCreator extends XYOSerializer<XyoEcdsaSignature> {

  constructor(private readonly minor: number) {
    super();
  }

  get description () {
    return {
      major: 0x05,
      minor: this.minor,
      sizeOfBytesToGetSize: 1
    };
  }

  public deserialize(buffer: Buffer) {
    return new XyoEcdsaSignature(
      buffer.slice(1),
      Buffer.from([this.description.major, this.minor])
    );
  }

  public serialize(ecdsaSignature: XyoEcdsaSignature) {
    return ecdsaSignature.signature;
  }

  public createFromPacked(buffer: Buffer) {
    return new XyoEcdsaSignature(
      buffer.slice(1),
      Buffer.from([this.description.major, this.description.minor])
    );
  }
}
