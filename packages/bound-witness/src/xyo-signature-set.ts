/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 10:08:31 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signature-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:51:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoSerializableObject, IXyoDeserializer, IXyoSerializationService, ParseQuery } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'
import { IXyoSignature } from "@xyo-network/signing"

export class XyoSignatureSet extends XyoBaseSerializable {
  public static deserializer: IXyoDeserializer<XyoSignatureSet>
  public schemaObjectId = schema.signatureSet.id

  constructor (public readonly signatures: IXyoSignature[]) {
    super(schema)
  }

  public getData(): IXyoSerializableObject[] {
    return this.signatures
  }

  public getReadableValue() {
    return this.signatures.map(signature => signature.getReadableValue())
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoSignatureSetDeserializer implements IXyoDeserializer<XyoSignatureSet> {
  public schemaObjectId = schema.signatureSet.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoSignatureSet {
    const parseResult = serializationService.parse(data)
    const query = new ParseQuery(parseResult)
    const signatures = query.mapChildren(
      sig => serializationService.deserialize(sig.readData(true)).hydrate<IXyoSignature>()
    )
    return new XyoSignatureSet(signatures)
  }
}

XyoSignatureSet.deserializer = new XyoSignatureSetDeserializer()
