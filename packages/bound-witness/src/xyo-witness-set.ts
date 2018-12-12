/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 11:18:52 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-witness-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:51:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoWitness, IXyoWitnessSet } from './@types'
import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, ParseQuery } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'

export class XyoWitnessSet extends XyoBaseSerializable implements IXyoWitnessSet {

  public static deserializer: IXyoDeserializer<IXyoWitnessSet>

  public schemaObjectId = schema.witnessSet.id

  constructor (public readonly witnesses: IXyoWitness[]) {
    super(schema)
  }

  public getData() {
    return this.witnesses
  }

  public getReadableValue() {
    return this.witnesses.map(witness => witness.getReadableValue())
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoWitnessSetDeserializer implements IXyoDeserializer<IXyoWitnessSet> {

  public schemaObjectId = schema.witnessSet.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): IXyoWitnessSet {
    const parseResult = serializationService.parse(data)
    const query = new ParseQuery(parseResult)
    const witnesses = query
      .mapChildren(
        fetter => serializationService
          .deserialize(fetter.readData(true))
          .hydrate<IXyoWitness>()
      )

    return new XyoWitnessSet(witnesses)
  }
}

XyoWitnessSet.deserializer = new XyoWitnessSetDeserializer()
