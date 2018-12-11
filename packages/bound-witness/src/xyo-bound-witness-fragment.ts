/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 11:32:18 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-fragment.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 10th December 2018 11:39:31 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitnessFragment, FetterOrWitness, IXyoFetter, IXyoWitness } from './@types'
import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, parse, ParseQuery } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'

export class XyoBoundWitnessFragment extends XyoBaseSerializable implements IXyoBoundWitnessFragment {

  public static deserializer: IXyoDeserializer<IXyoBoundWitnessFragment>

  public readonly schemaObjectId = schema.boundWitnessFragment.id

  constructor (public readonly fetterWitnesses: FetterOrWitness[]) {
    super()
  }

  public getData() {
    return this.fetterWitnesses
  }

}

// tslint:disable-next-line:max-classes-per-file
class XyoBoundWitnessFragmentDeserializer implements IXyoDeserializer<IXyoBoundWitnessFragment> {
  public readonly schemaObjectId = schema.boundWitnessFragment.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): IXyoBoundWitnessFragment {
    const parseResult = parse(data)
    const query = new ParseQuery(parseResult)
    const fetterWitnesses = query.mapChildren((fetterOrWitness) => {
      return serializationService
        .deserialize(fetterOrWitness.readData(true))
        .hydrate<IXyoFetter | IXyoWitness>()
    })

    return new XyoBoundWitnessFragment(fetterWitnesses)
  }
}

XyoBoundWitnessFragment.deserializer = new XyoBoundWitnessFragmentDeserializer()
