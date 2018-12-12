/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 1:23:15 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:48:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { getUnsignedIntegerSerializer, getSignedIntegerSerializer, getDoubleSerializer, XyoSerializableNumber } from '@xyo-network/heuristics'
import { schema } from '@xyo-network/serialization-schema'
import { XyoBaseSerializable, IXyoDeserializer, ParseQuery, IXyoSerializationService } from '@xyo-network/serialization'

export const rssiSerializationProvider = getSignedIntegerSerializer(schema, schema.rssi.id)
export const unixTimeSerializationProvider = getUnsignedIntegerSerializer(schema, schema.time.id)
export const latitudeSerializationProvider = getDoubleSerializer(schema, schema.latitude.id)
export const longitudeSerializationProvider = getDoubleSerializer(schema, schema.longitude.id)

export class XyoGps extends XyoBaseSerializable {
  public static deserializer: IXyoDeserializer<XyoGps>

  public readonly schemaObjectId = schema.gps.id

  constructor (public readonly latitude: number, public readonly longitude: number) {
    super(schema)
  }

  public getData() {
    return [
      latitudeSerializationProvider.newInstance(this.latitude),
      longitudeSerializationProvider.newInstance(this.longitude)
    ]
  }

  public getReadableValue() {
    return {
      latitude: this.latitude,
      longitude: this.longitude
    }
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoGpsDeserializer implements IXyoDeserializer<XyoGps> {
  public schemaObjectId = schema.gps.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoGps {
    const parseResult = serializationService.parse(data)
    const parseQuery = new ParseQuery(parseResult)

    return new XyoGps(
      serializationService
        .deserialize(parseQuery.getChildAt(0).readData(true))
        .hydrate<XyoSerializableNumber>().number,
      serializationService.deserialize(parseQuery.getChildAt(1).readData(true))
        .hydrate<XyoSerializableNumber>().number
    )
  }
}

XyoGps.deserializer = new XyoGpsDeserializer()
