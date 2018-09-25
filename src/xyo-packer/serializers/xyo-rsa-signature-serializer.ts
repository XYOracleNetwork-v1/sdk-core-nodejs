/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 12:51:38 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-signature-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st September 2018 12:29:29 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaSignature } from '../../components/signing/algorithms/rsa/xyo-rsa-signature';
import { XYOSerializer } from '../xyo-serializer';
import { XyoSignature } from '../../components/signing/xyo-signature';
import { XyoObject } from '../../components/xyo-object';
import { XyoSignerProvider } from '../../signing/xyo-signer-provider';

export class XyoRsaSignatureSerializer extends XYOSerializer<XyoRsaSignature> {

  constructor(
    private readonly minor: number,
    private readonly xyoRsaSignerProvider: XyoSignerProvider,
    private readonly xyoRSASignatureClass: {
      new (
        signature: Buffer,
        verifySign: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>
      ): XyoRsaSignature
    }
  ) {
    super();
  }

  get description () {
    return {
      major: 0x05,
      minor: this.minor,
      sizeOfBytesToGetSize: 2,
      sizeIdentifierSize: 2
    };
  }

  public deserialize(buffer: Buffer) {
    return new this.xyoRSASignatureClass(
      buffer.slice(2),
      this.xyoRsaSignerProvider.verifySign
    );
  }

  public serialize(rsaSignature: XyoRsaSignature) {
    return rsaSignature.rawSignature;
  }
}
