/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 12:11:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bridge-block-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:55:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoDeserializer, ParseQuery, IXyoSerializationService } from "@xyo-network/serialization"
import { schema } from "@xyo-network/serialization-schema"
import { IXyoBoundWitness } from "@xyo-network/bound-witness"

export class XyoBridgeBlockSet extends XyoBaseSerializable {

  public static deserializer: IXyoDeserializer<XyoBridgeBlockSet>

  public readonly schemaObjectId = schema.bridgeBlockSet.id

  constructor (public readonly boundWitnesses: IXyoBoundWitness[]) {
    super(schema)
  }

  public getData() {
    return this.boundWitnesses
  }

  public getReadableValue() {
    return this.boundWitnesses.map(boundWitness => boundWitness.getReadableValue())
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoBridgeBlockSetDeserializer implements IXyoDeserializer<XyoBridgeBlockSet> {
  public readonly schemaObjectId = schema.bridgeBlockSet.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoBridgeBlockSet {
    const parseResult = serializationService.parse(data)
    const query = new ParseQuery(parseResult)
    const boundWitnesses = query.mapChildren((boundWitness) => {
      return serializationService.deserialize(boundWitness.readData(true)).hydrate<IXyoBoundWitness>()
    })
    return new XyoBridgeBlockSet(boundWitnesses)
  }
}

XyoBridgeBlockSet.deserializer = new XyoBridgeBlockSetDeserializer()
