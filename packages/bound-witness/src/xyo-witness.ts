/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 10:43:28 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-witness.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 11:25:37 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSignatureSet, IXyoWitness } from "./@types"
import { XyoBaseSerializable, IXyoSerializableObject, IXyoDeserializer, parse, ParseQuery, IXyoSerializationService } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'

export class XyoWitness extends XyoBaseSerializable  implements IXyoWitness {

  public static deserializer: IXyoDeserializer<IXyoWitness>

  public readonly schemaObjectId = schema.witness.id

  public constructor (
    public signatureSet: IXyoSignatureSet,
    public metadata: IXyoSerializableObject[]
  ) {
    super(schema)
  }

  public getData(): IXyoSerializableObject | IXyoSerializableObject[] | Buffer {
    return [
      this.signatureSet,
      ...this.metadata
    ]
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoWitnessDeserializer implements IXyoDeserializer<IXyoWitness> {
  public readonly schemaObjectId = schema.witness.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): IXyoWitness {
    const parseResult = parse(data, serializationService.schema)
    const query = new ParseQuery(parseResult)
    const signatureSetItem = query.getChildAt(0)
    const signatureSet = serializationService
      .deserialize(signatureSetItem.readData(true))
      .hydrate<IXyoSignatureSet>(serializationService)
    const childrenCount = query.getChildrenCount()
    let childIndex = 1
    const metadata: IXyoSerializableObject[] = []
    while (childIndex < childrenCount) {
      const metadataChild = query.getChildAt(childIndex)
      const heuristic = serializationService.deserialize(metadataChild.readData(true)).hydrate(serializationService)
      metadata.push(heuristic)
      childIndex += 1
    }

    return new XyoWitness(signatureSet, metadata)
  }
}

XyoWitness.deserializer = new XyoWitnessDeserializer()