/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 10:53:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-signature-deserializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 12:23:58 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDeserializer, IXyoSerializationService } from '@xyo-network/serialization'
import { XyoEcdsaSignature } from '.'
import { IXyoSignerProvider } from '@xyo-network/signing'

export class XyoEcdsaSignatureDeserializer implements IXyoDeserializer<XyoEcdsaSignature> {

  constructor (public readonly schemaObjectId: number, public readonly signerProvider: IXyoSignerProvider) {}

  public deserialize(data: Buffer, serializationService: IXyoSerializationService) {
    const parseResult = serializationService.parse(data)

    return new XyoEcdsaSignature(parseResult.dataBytes,
      this.schemaObjectId,
      this.signerProvider.verifySign.bind(this.signerProvider)
    )
  }
}
