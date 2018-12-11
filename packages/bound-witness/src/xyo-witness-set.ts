/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 11:18:52 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-witness-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 10th December 2018 11:28:35 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoWitness, IXyoWitnessSet } from './@types'
import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, parse, ParseQuery } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'

export class XyoWitnessSet extends XyoBaseSerializable implements IXyoWitnessSet {

  public static deserializer: IXyoDeserializer<IXyoWitnessSet>

  public schemaObjectId = schema.witnessSet.id

  constructor (public readonly witnesses: IXyoWitness[]) {
    super()
  }

  public getData() {
    return this.witnesses
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoWitnessSetDeserializer implements IXyoDeserializer<IXyoWitnessSet> {

  public schemaObjectId = schema.witnessSet.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): IXyoWitnessSet {
    const parseResult = parse(data)
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
