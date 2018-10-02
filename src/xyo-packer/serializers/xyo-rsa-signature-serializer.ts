/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 12:51:38 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-signature-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:25:18 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaSignature } from '../../signing/rsa/xyo-rsa-signature';
import { XyoSerializer } from '../xyo-serializer';
import { XyoSignature } from '../../signing/xyo-signature';
import { XyoObject } from '../../components/xyo-object';
import { XyoSignerProvider } from '../../signing/xyo-signer-provider';

export class XyoRsaSignatureSerializer extends XyoSerializer<XyoRsaSignature> {

  constructor(
    private readonly minor: number,
    private readonly xyoRsaSignerProvider: XyoSignerProvider,
    private readonly xyoRsaSignatureClass: {
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
    return new this.xyoRsaSignatureClass(
      buffer.slice(2),
      this.xyoRsaSignerProvider.verifySign
    );
  }

  public serialize(rsaSignature: XyoRsaSignature) {
    return rsaSignature.rawSignature;
  }
}
