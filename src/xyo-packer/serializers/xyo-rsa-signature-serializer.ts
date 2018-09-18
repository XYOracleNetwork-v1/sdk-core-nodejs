/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 12:51:38 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-signature-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 4:56:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaSignature } from '../../components/signing/algorithms/rsa/xyo-rsa-signature';
import { XYOSerializer } from '../xyo-serializer';

export class XyoRsaSignatureCreator extends XYOSerializer<XyoRsaSignature> {

  constructor(private readonly minor: number) {
    super();
  }

  get description () {
    return {
      major: 0x05,
      minor: this.minor,
      sizeOfBytesToGetSize: 2
    };
  }

  public deserialize(buffer: Buffer) {
    return new XyoRsaSignature(
      buffer.slice(2),
      Buffer.from([this.description.major, this.description.minor])
    );
  }

  public serialize(rsaSignature: XyoRsaSignature) {
    return rsaSignature.rawSignature;
  }
}
