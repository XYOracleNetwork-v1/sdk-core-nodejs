/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 10:53:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature-deserializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 7th December 2018 11:40:17 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDeserializer, parse } from '@xyo-network/serialization'
import { XyoEcdsaSignature } from '.'
import { IXyoSignerProvider } from '@xyo-network/signing'

export class XyoEcdsaSignatureDeserializer implements IXyoDeserializer<XyoEcdsaSignature> {

  constructor (public readonly schemaObjectId: number, public readonly signerProvider: IXyoSignerProvider) {}

  public deserialize(data: Buffer) {
    const parseResult = parse(data)

    return new XyoEcdsaSignature(parseResult.dataBytes,
      this.schemaObjectId,
      this.signerProvider.verifySign.bind(this.signerProvider)
    )
  }
}
