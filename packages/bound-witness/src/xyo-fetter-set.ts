/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 11:18:52 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-fetter-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 11:26:54 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoFetterSet, IXyoFetter } from './@types'
import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, parse, ParseQuery } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'

export class XyoFetterSet extends XyoBaseSerializable implements IXyoFetterSet {

  public static deserializer: IXyoDeserializer<IXyoFetterSet>

  public schemaObjectId = schema.fetterSet.id

  constructor (public readonly fetters: IXyoFetter[]) {
    super(schema)
  }

  public getData() {
    return this.fetters
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoFetterSetDeserializer implements IXyoDeserializer<IXyoFetterSet> {

  public schemaObjectId = schema.fetterSet.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): IXyoFetterSet {
    const parseResult = parse(data, serializationService.schema)
    const query = new ParseQuery(parseResult)
    const fetters = query
      .mapChildren(
        fetter => serializationService
          .deserialize(fetter.readData(true))
          .hydrate<IXyoFetter>(serializationService)
      )

    return new XyoFetterSet(fetters)
  }
}

XyoFetterSet.deserializer = new XyoFetterSetDeserializer()
