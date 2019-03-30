/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 1:23:15 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 4th March 2019 10:47:10 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { getSignedIntegerSerializer, getDoubleSerializer, XyoSerializableNumber } from '@xyo-network/heuristics'
import { schema } from '@xyo-network/serialization-schema'
import { XyoBaseSerializable, IXyoDeserializer, ParseQuery, IXyoSerializationService } from '@xyo-network/serialization'
import { writeIntegerToBuffer, readIntegerFromBuffer } from '@xyo-network/buffer-utils'

export const rssiSerializationProvider = getSignedIntegerSerializer(schema, schema.rssi.id)
export const latitudeSerializationProvider = getDoubleSerializer(schema, schema.latitude.id)
export const longitudeSerializationProvider = getDoubleSerializer(schema, schema.longitude.id)

export class XyoUnixTime extends XyoBaseSerializable {
  public static deserializer: IXyoDeserializer<XyoUnixTime>

  public schemaObjectId = schema.time.id

  constructor (private readonly date: Date) {
    super(schema)
  }

  public getData() {
    return writeIntegerToBuffer(this.date.valueOf(), 8, false)
  }

  public getReadableValue() {
    return this.date.toISOString()
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoUnixTimeDeserializer implements IXyoDeserializer<XyoUnixTime> {
  public schemaObjectId = schema.time.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoUnixTime {
    const parseResult = serializationService.parse(data)
    const resultingNumber = readIntegerFromBuffer(parseResult.dataBytes, 8, false)
    return new XyoUnixTime(new Date(resultingNumber))
  }
}

XyoUnixTime.deserializer = new XyoUnixTimeDeserializer()

// tslint:disable-next-line:max-classes-per-file
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

// tslint:disable-next-line:max-classes-per-file
export class XyoJSONBlob  extends XyoBaseSerializable {
  public static deserializer: IXyoDeserializer<XyoJSONBlob>
  public readonly schemaObjectId = schema.jsonBlob.id

  constructor(public readonly jsonStr: string) {
    super(schema)
  }

  public getData() {
    return Buffer.from(this.jsonStr)
  }

  public getReadableValue() {
    return this.getJSON()
  }

  public getJSON() {
    return JSON.parse(this.jsonStr)
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoJSONBlobDeserializer implements IXyoDeserializer<XyoJSONBlob> {
  public schemaObjectId = schema.jsonBlob.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoJSONBlob {
    const parseResult = serializationService.parse(data)
    return new XyoJSONBlob(parseResult.dataBytes.toString())
  }
}

XyoJSONBlob.deserializer = new XyoJSONBlobDeserializer()
