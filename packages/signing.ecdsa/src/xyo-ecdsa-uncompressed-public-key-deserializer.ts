/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 11:05:37 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-uncompressed-public-key-deserializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDeserializer, IXyoSerializationService } from '@xyo-network/serialization'
import { XyoEcdsaSecp256k1UnCompressedPublicKey } from '.'
import { XyoError, XyoErrors } from '@xyo-network/errors'

// tslint:disable-next-line:max-line-length
export class XyoEcdsaUncompressedPublicKeyDeserializer implements IXyoDeserializer<XyoEcdsaSecp256k1UnCompressedPublicKey> {

  constructor (public readonly schemaObjectId: number) {}

  public deserialize(data: Buffer, serializationService: IXyoSerializationService) {
    const parseResult = serializationService.parse(data)

    if (parseResult.dataBytes.length !== 64) {
      throw new XyoError(`Could not deserialize XyoEcdsaSecp256k1UnCompressedPublicKey`)
    }

    return new XyoEcdsaSecp256k1UnCompressedPublicKey(
      parseResult.dataBytes.slice(0, 32),
      parseResult.dataBytes.slice(32),
      this.schemaObjectId
    )
  }
}
